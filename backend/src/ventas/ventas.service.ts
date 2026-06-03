import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './venta.entity';
import { VentaItem } from './venta-item.entity';
import { Producto } from '../productos/producto.entity';
import { Movimiento } from '../inventario/movimiento.entity';
import { Cliente } from '../clientes/cliente.entity';

interface ItemDto {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
}

@Injectable()
export class VentasService {
    constructor(
        @InjectRepository(Venta) private ventaRepo: Repository<Venta>,
        @InjectRepository(VentaItem) private itemRepo: Repository<VentaItem>,
        @InjectRepository(Producto) private productoRepo: Repository<Producto>,
        @InjectRepository(Movimiento) private movimientoRepo: Repository<Movimiento>,
        @InjectRepository(Cliente) private clienteRepo: Repository<Cliente>,
    ) {}

    getAll() {
        return this.ventaRepo.find({ order: { fecha: 'DESC' } });
    }

    async getByCliente(clienteId: number) {
        const ventas = await this.ventaRepo.find({
            where: { cliente: { id: clienteId } },
            order: { fecha: 'DESC' },
        });
        return ventas;
    }

    // Uso interno: devuelve la entidad TypeORM con relaciones
    private async findEntidad(id: number): Promise<Venta> {
        const venta = await this.ventaRepo.findOne({
            where: { id },
            relations: { items: { producto: true }, cliente: true },
        });
        if (!venta) throw new NotFoundException('Venta no encontrada');
        return venta;
    }

    // Uso HTTP: devuelve objeto plano sin referencias circulares
    async getById(id: number) {
        const venta = await this.findEntidad(id);
        return this.toDto(venta);
    }

    private toDto(venta: Venta) {
        const montoPagado = Number(venta.montoPagado ?? 0);
        const total = Number(venta.total ?? 0);
        const saldo = Math.max(total - montoPagado, 0);
        let estadoPago: string;
        if (montoPagado <= 0) estadoPago = 'pendiente';
        else if (saldo > 0) estadoPago = 'abonado';
        else estadoPago = 'pagado';

        return {
            id: venta.id,
            numero: venta.numero,
            clienteNombre: venta.clienteNombre,
            montoPagado,
            saldo,
            estadoPago,
            cliente: venta.cliente
                ? {
                      id: venta.cliente.id,
                      nombre: venta.cliente.nombre,
                      telefono: venta.cliente.telefono,
                      email: venta.cliente.email ?? null,
                      documento: venta.cliente.documento ?? null,
                  }
                : null,
            estado: venta.estado,
            origen: venta.origen ?? 'admin',
            total: venta.total,
            fecha: venta.fecha,
            items: (venta.items ?? []).map(item => ({
                id: item.id,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                costoUnitario: item.costoUnitario ?? 0,
                subtotal: item.subtotal,
                producto: item.producto
                    ? {
                          id: item.producto.id,
                          nombre: item.producto.nombre,
                          precio: item.producto.precio,
                          imagen: item.producto.imagen ?? null,
                      }
                    : null,
            })),
        };
    }

    async crear(clienteNombre: string, items: ItemDto[], clienteId?: number) {
        if (!clienteNombre?.trim()) throw new BadRequestException('El nombre del cliente es obligatorio');
        if (!items || items.length === 0) throw new BadRequestException('Debe agregar al menos un producto');

        let total = 0;
        const itemsEntidad: VentaItem[] = [];

        for (const dto of items) {
            const producto = await this.productoRepo.findOne({ where: { id: dto.productoId } });
            if (!producto) throw new NotFoundException(`Producto ${dto.productoId} no encontrado`);

            const subtotal = Number(dto.cantidad) * Number(dto.precioUnitario);
            total += subtotal;

            const item = this.itemRepo.create({
                producto,
                cantidad: dto.cantidad,
                precioUnitario: dto.precioUnitario,
                costoUnitario: Number(producto.costo) || 0,
                subtotal,
            });
            itemsEntidad.push(item);
        }

        let cliente: Cliente | null = null;
        if (clienteId) {
            cliente = await this.clienteRepo.findOne({ where: { id: clienteId } });
        }

        const venta = this.ventaRepo.create({
            clienteNombre,
            cliente: cliente,
            estado: 'cotizacion',
            total,
            items: itemsEntidad,
        });

        const guardada = (await this.ventaRepo.save(venta) as unknown) as Venta;
        guardada.numero = `VTA-${guardada.id.toString().padStart(4, '0')}`;
        await this.ventaRepo.save(guardada);
        return this.getById(guardada.id);
    }

    async confirmar(id: number) {
        const venta = await this.findEntidad(id);
        if (venta.estado !== 'cotizacion') {
            throw new BadRequestException('Solo se pueden confirmar cotizaciones pendientes');
        }

        for (const item of venta.items) {
            const producto = await this.productoRepo.findOne({ where: { id: item.producto.id } });
            if (!producto) throw new NotFoundException('Producto no encontrado');
            if (producto.stock < item.cantidad) {
                throw new BadRequestException(
                    `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, requerido: ${item.cantidad}`
                );
            }
        }

        for (const item of venta.items) {
            const producto = await this.productoRepo.findOne({ where: { id: item.producto.id } });
            if (!producto) continue;
            producto.stock -= item.cantidad;
            await this.productoRepo.save(producto);

            const mov = this.movimientoRepo.create({
                tipo: 'salida',
                cantidad: item.cantidad,
                motivo: `Venta ${venta.numero}`,
                ubicacionOrigen: 'principal',
                stockPrincipalDespues: producto.stock,
                stockAveriasDespues: producto.stockAverias,
                producto,
            });
            await this.movimientoRepo.save(mov);
        }

        venta.estado = 'confirmada';
        await this.ventaRepo.save(venta);
        return this.getById(id);
    }

    async anular(id: number) {
        const venta = await this.findEntidad(id);
        if (venta.estado !== 'confirmada') {
            throw new BadRequestException('Solo se pueden anular órdenes confirmadas');
        }

        for (const item of venta.items) {
            const producto = await this.productoRepo.findOne({ where: { id: item.producto.id } });
            if (!producto) continue;

            producto.stock += item.cantidad;
            await this.productoRepo.save(producto);

            const mov = this.movimientoRepo.create({
                tipo: 'recepcion',
                cantidad: item.cantidad,
                motivo: `Devolución — anulación de ${venta.numero}`,
                ubicacionOrigen: 'principal',
                stockPrincipalDespues: producto.stock,
                stockAveriasDespues: producto.stockAverias,
                producto,
            });
            await this.movimientoRepo.save(mov);
        }

        venta.estado = 'anulada';
        await this.ventaRepo.save(venta);
        return this.getById(id);
    }

    async actualizar(id: number, clienteNombre: string, items: ItemDto[], clienteId?: number) {
        const venta = await this.findEntidad(id);
        if (venta.estado !== 'cotizacion') {
            throw new BadRequestException('Solo se pueden editar cotizaciones pendientes');
        }
        if (!items || items.length === 0) throw new BadRequestException('Debe agregar al menos un producto');

        await this.itemRepo.remove(venta.items);
        venta.items = [];

        let total = 0;
        const itemsEntidad: VentaItem[] = [];

        for (const dto of items) {
            const producto = await this.productoRepo.findOne({ where: { id: dto.productoId } });
            if (!producto) throw new NotFoundException(`Producto ${dto.productoId} no encontrado`);
            const subtotal = Number(dto.cantidad) * Number(dto.precioUnitario);
            total += subtotal;
            const item = this.itemRepo.create({
                producto,
                cantidad: dto.cantidad,
                precioUnitario: dto.precioUnitario,
                costoUnitario: Number(producto.costo) || 0,
                subtotal,
            });
            itemsEntidad.push(item);
        }

        let cliente: Cliente | null = null;
        if (clienteId) {
            cliente = await this.clienteRepo.findOne({ where: { id: clienteId } });
        }

        venta.clienteNombre = clienteNombre;
        venta.cliente = cliente;
        venta.total = total;
        venta.items = itemsEntidad;
        await this.ventaRepo.save(venta);
        return this.getById(id);
    }

    async reactivar(id: number) {
        const venta = await this.ventaRepo.findOne({ where: { id } });
        if (!venta) throw new NotFoundException('Venta no encontrada');
        if (venta.estado !== 'cancelada' && venta.estado !== 'anulada') {
            throw new BadRequestException('Solo se pueden reactivar ventas canceladas o anuladas');
        }
        venta.estado = 'cotizacion';
        await this.ventaRepo.save(venta);
        return this.getById(id);
    }

    async cancelar(id: number) {
        const venta = await this.ventaRepo.findOne({ where: { id } });
        if (!venta) throw new NotFoundException('Venta no encontrada');
        if (venta.estado === 'confirmada') {
            throw new BadRequestException('No se puede cancelar una venta ya confirmada');
        }
        venta.estado = 'cancelada';
        await this.ventaRepo.save(venta);
        return this.getById(id);
    }

    async getReporteMargenes(desde?: string, hasta?: string) {
        const qb = this.ventaRepo.createQueryBuilder('v')
            .leftJoinAndSelect('v.items', 'item')
            .leftJoinAndSelect('item.producto', 'prod')
            .leftJoinAndSelect('v.cliente', 'cliente')
            .where('v.estado = :estado', { estado: 'confirmada' });

        if (desde) qb.andWhere('v.fecha >= :desde', { desde: desde + ' 00:00:00' });
        if (hasta) qb.andWhere('v.fecha <= :hasta', { hasta: hasta + ' 23:59:59' });

        qb.orderBy('v.fecha', 'DESC');
        const ventas = await qb.getMany();

        const filas = ventas.map(v => {
            const totalVenta = Number(v.total);
            const costoTotal = (v.items ?? []).reduce(
                (s, item) => s + Number(item.costoUnitario ?? 0) * Number(item.cantidad),
                0,
            );
            const margen = totalVenta - costoTotal;
            const margenPct = totalVenta > 0 ? (margen / totalVenta) * 100 : 0;

            return {
                id: v.id,
                numero: v.numero,
                cliente: v.cliente?.nombre ?? v.clienteNombre,
                fecha: v.fecha,
                totalVenta,
                costoTotal,
                margen,
                margenPct: Math.round(margenPct * 10) / 10,
            };
        });

        const resumen = {
            totalVentas: filas.reduce((s, f) => s + f.totalVenta, 0),
            totalCosto: filas.reduce((s, f) => s + f.costoTotal, 0),
            totalMargen: filas.reduce((s, f) => s + f.margen, 0),
            margenPromedio: filas.length > 0
                ? Math.round(filas.reduce((s, f) => s + f.margenPct, 0) / filas.length * 10) / 10
                : 0,
        };

        return { filas, resumen };
    }

    async crearDesdeCarrito(clienteNombre: string, items: { productoId: number; cantidad: number; precio: number }[]) {
        if (!items.length) throw new BadRequestException('El carrito está vacío');

        let total = 0;
        const itemsEntidad: VentaItem[] = [];

        for (const dto of items) {
            const producto = await this.productoRepo.findOne({ where: { id: dto.productoId } });
            if (!producto) throw new NotFoundException(`Producto ${dto.productoId} no encontrado`);

            const subtotal = Number(dto.cantidad) * Number(dto.precio);
            total += subtotal;

            const item = this.itemRepo.create({
                producto,
                cantidad: dto.cantidad,
                precioUnitario: dto.precio,
                costoUnitario: Number(producto.costo) || 0,
                subtotal,
            });
            itemsEntidad.push(item);
        }

        const venta = this.ventaRepo.create({
            clienteNombre,
            estado: 'cotizacion',
            origen: 'ecommerce',
            total,
            items: itemsEntidad,
        });

        const guardada = (await this.ventaRepo.save(venta)) as Venta;
        guardada.numero = `WEB-${guardada.id.toString().padStart(4, '0')}`;
        await this.ventaRepo.save(guardada);

        return { id: guardada.id, numero: guardada.numero, total };
    }

    async eliminar(id: number) {
        const venta = await this.ventaRepo.findOne({ where: { id } });
        if (!venta) throw new NotFoundException('Venta no encontrada');
        if (venta.estado !== 'cotizacion') {
            throw new BadRequestException('Solo se pueden eliminar cotizaciones. Las órdenes confirmadas deben anularse primero.');
        }
        await this.ventaRepo.remove(venta);
    }
}
