import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Compra } from './compra.entity';
import { CompraItem } from './compra-item.entity';
import { Proveedor } from './proveedor.entity';
import { Producto } from '../productos/producto.entity';
import { Movimiento } from '../inventario/movimiento.entity';

interface ItemDto {
    productoId: number;
    cantidad: number;
    precioCompra: number;
}

@Injectable()
export class ComprasService {
    constructor(
        @InjectRepository(Compra) private compraRepo: Repository<Compra>,
        @InjectRepository(CompraItem) private itemRepo: Repository<CompraItem>,
        @InjectRepository(Proveedor) private proveedorRepo: Repository<Proveedor>,
        @InjectRepository(Producto) private productoRepo: Repository<Producto>,
        @InjectRepository(Movimiento) private movimientoRepo: Repository<Movimiento>,
    ) {}

    getAll() {
        return this.compraRepo.find({
            relations: { proveedor: true },
            order: { fecha: 'DESC' },
        });
    }

    private async findEntidad(id: number): Promise<Compra> {
        const compra = await this.compraRepo.findOne({
            where: { id },
            relations: { proveedor: true, items: { producto: true } },
        });
        if (!compra) throw new NotFoundException('Compra no encontrada');
        return compra;
    }

    async getById(id: number) {
        const compra = await this.findEntidad(id);
        return this.toDto(compra);
    }

    private toDto(compra: Compra) {
        return {
            id: compra.id,
            numero: compra.numero,
            estado: compra.estado,
            total: compra.total,
            fecha: compra.fecha,
            facturaProveedor: compra.facturaProveedor,
            fechaVencimiento: compra.fechaVencimiento,
            proveedor: compra.proveedor
                ? {
                      id: compra.proveedor.id,
                      nombre: compra.proveedor.nombre,
                      nit: compra.proveedor.nit,
                      telefono: compra.proveedor.telefono,
                      email: compra.proveedor.email,
                  }
                : null,
            items: (compra.items ?? []).map(item => ({
                id: item.id,
                cantidad: item.cantidad,
                precioCompra: item.precioCompra,
                subtotal: item.subtotal,
                producto: item.producto
                    ? {
                          id: item.producto.id,
                          nombre: item.producto.nombre,
                          imagen: item.producto.imagen ?? null,
                      }
                    : null,
            })),
        };
    }

    async crear(
        proveedorId: number,
        items: ItemDto[],
        facturaProveedor?: string,
        fechaVencimiento?: string,
    ) {
        const proveedor = await this.proveedorRepo.findOne({ where: { id: proveedorId } });
        if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
        if (!items || items.length === 0) throw new BadRequestException('Debe agregar al menos un producto');

        let total = 0;
        const itemsEntidad: CompraItem[] = [];

        for (const dto of items) {
            const producto = await this.productoRepo.findOne({ where: { id: dto.productoId } });
            if (!producto) throw new NotFoundException(`Producto ${dto.productoId} no encontrado`);

            const subtotal = Number(dto.cantidad) * Number(dto.precioCompra);
            total += subtotal;

            const item = this.itemRepo.create({
                producto,
                cantidad: dto.cantidad,
                precioCompra: dto.precioCompra,
                subtotal,
            });
            itemsEntidad.push(item);
        }

        const compra = this.compraRepo.create({
            proveedor,
            estado: 'pedido',
            total,
            facturaProveedor: facturaProveedor ?? undefined,
            fechaVencimiento: fechaVencimiento ?? undefined,
            items: itemsEntidad,
        });

        const guardada = (await this.compraRepo.save(compra) as unknown) as Compra;
        guardada.numero = `OC-${guardada.id.toString().padStart(4, '0')}`;
        await this.compraRepo.save(guardada);
        return this.getById(guardada.id);
    }

    async actualizar(
        id: number,
        proveedorId: number,
        items: ItemDto[],
        facturaProveedor?: string,
        fechaVencimiento?: string,
    ) {
        const compra = await this.findEntidad(id);
        if (compra.estado !== 'pedido') {
            throw new BadRequestException('Solo se pueden editar pedidos pendientes');
        }

        const proveedor = await this.proveedorRepo.findOne({ where: { id: proveedorId } });
        if (!proveedor) throw new NotFoundException('Proveedor no encontrado');

        await this.itemRepo.remove(compra.items);
        compra.items = [];

        let total = 0;
        const itemsEntidad: CompraItem[] = [];

        for (const dto of items) {
            const producto = await this.productoRepo.findOne({ where: { id: dto.productoId } });
            if (!producto) throw new NotFoundException(`Producto ${dto.productoId} no encontrado`);

            const subtotal = Number(dto.cantidad) * Number(dto.precioCompra);
            total += subtotal;

            const item = this.itemRepo.create({
                producto,
                cantidad: dto.cantidad,
                precioCompra: dto.precioCompra,
                subtotal,
            });
            itemsEntidad.push(item);
        }

        compra.proveedor = proveedor;
        compra.total = total;
        compra.facturaProveedor = facturaProveedor ?? compra.facturaProveedor;
        compra.fechaVencimiento = fechaVencimiento ?? compra.fechaVencimiento;
        compra.items = itemsEntidad;
        await this.compraRepo.save(compra);
        return this.getById(id);
    }

    async recibir(id: number) {
        const compra = await this.findEntidad(id);
        if (compra.estado !== 'pedido') {
            throw new BadRequestException('Solo se pueden recibir pedidos pendientes');
        }

        for (const item of compra.items) {
            const producto = await this.productoRepo.findOne({ where: { id: item.producto.id } });
            if (!producto) continue;

            producto.stock += item.cantidad;
            await this.productoRepo.save(producto);

            const mov = this.movimientoRepo.create({
                tipo: 'recepcion',
                cantidad: item.cantidad,
                motivo: `Compra ${compra.numero}`,
                ubicacionOrigen: 'proveedor',
                stockPrincipalDespues: producto.stock,
                stockAveriasDespues: producto.stockAverias,
                producto,
            });
            await this.movimientoRepo.save(mov);
        }

        compra.estado = 'recibido';
        await this.compraRepo.save(compra);
        return this.getById(id);
    }

    async cancelar(id: number) {
        const compra = await this.compraRepo.findOne({ where: { id } });
        if (!compra) throw new NotFoundException('Compra no encontrada');
        if (compra.estado === 'recibido') {
            throw new BadRequestException('No se puede cancelar una compra ya recibida');
        }
        compra.estado = 'cancelado';
        await this.compraRepo.save(compra);
        return this.getById(id);
    }

    async getHistorialProveedor(proveedorId: number) {
        const proveedor = await this.proveedorRepo.findOne({ where: { id: proveedorId } });
        if (!proveedor) throw new NotFoundException('Proveedor no encontrado');

        const compras = await this.compraRepo.find({
            where: { proveedor: { id: proveedorId } },
            relations: { proveedor: true, items: { producto: true } },
            order: { fecha: 'DESC' },
        });

        const totalOrdenes = compras.length;
        const totalInvertido = compras
            .filter(c => c.estado === 'recibido')
            .reduce((s, c) => s + Number(c.total), 0);
        const ultimaCompra = compras.length > 0 ? compras[0].fecha : null;

        return {
            proveedor: {
                id: proveedor.id,
                nombre: proveedor.nombre,
                nit: proveedor.nit ?? null,
                telefono: proveedor.telefono ?? null,
                email: proveedor.email ?? null,
            },
            stats: { totalOrdenes, totalInvertido, ultimaCompra },
            compras: compras.map(c => this.toDto(c)),
        };
    }
}
