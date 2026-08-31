import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CarritoItem } from './carrito-item.entity';
import { Producto } from '../productos/producto.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(CarritoItem)
    private readonly carritoRepository: Repository<CarritoItem>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly configService: ConfigService,
  ) {}

    getCarrito(usuarioId: number) {
        return this.carritoRepository.find({
            where: { usuario: { id: usuarioId } },
            relations: { producto: true },
        });
    }

    async actualizarItem(id: number, cantidad: number) {
        const item = await this.carritoRepository.findOne({
            where: { id },
            relations: { producto: true },
        });
        if (!item) throw new NotFoundException('Item no encontrado en el carrito');

        if (cantidad > item.producto.stock) {
            throw new BadRequestException(
                `Solo hay ${item.producto.stock} unidades disponibles de "${item.producto.nombre}"`
            );
        }

        return this.carritoRepository.update(id, { cantidad });
    }

    async agregarItem(usuarioId: number, productoId: number, cantidad: number) {
        const producto = await this.productoRepository.findOne({ where: { id: productoId } });
        if (!producto) throw new NotFoundException('Producto no encontrado');

        if (producto.stock === 0) {
            throw new BadRequestException(`"${producto.nombre}" está agotado`);
        }

        const itemExistente = await this.carritoRepository.findOne({
            where: { usuario: { id: usuarioId }, producto: { id: productoId } },
        });

        const cantidadTotal = (itemExistente?.cantidad ?? 0) + cantidad;
        if (cantidadTotal > producto.stock) {
            throw new BadRequestException(
                `Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}"`
            );
        }

        if (itemExistente) {
            return this.actualizarItem(itemExistente.id, cantidadTotal);
        }

        const newItem = this.carritoRepository.create({
            usuario: { id: usuarioId },
            producto: { id: productoId },
            cantidad,
        });

        return this.carritoRepository.save(newItem);
    }

    async eliminarItem(id: number): Promise<void> {
        await this.carritoRepository.delete(id);
    }

    async checkout(usuarioId: number) {
        const items = await this.carritoRepository.find({
            where: { usuario: { id: usuarioId } },
            relations: { producto: true },
        });

        if (!items.length) throw new BadRequestException('El carrito está vacío');

        for (const item of items) {
            if (item.producto.stock < item.cantidad) {
                throw new BadRequestException(
                    `Stock insuficiente para "${item.producto.nombre}". Disponible: ${item.producto.stock}, solicitado: ${item.cantidad}`
                );
            }
        }

        const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
        const clienteNombre = usuario?.nombre ?? `Cliente #${usuarioId}`;

        const total = items.reduce(
            (sum, item) => sum + Number(item.producto.precioDolar) * item.cantidad,
            0,
        );

        const lineas = items.map(
            item => `- ${item.producto.nombre} x${item.cantidad} ($${Number(item.producto.precioDolar).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)`
        );

        const mensaje =
            `Hola! Soy ${clienteNombre} y quiero hacer el siguiente pedido:\n\n` +
            lineas.join('\n') +
            `\n\nTotal: $${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;

        const numero = this.configService.get<string>('WHATSAPP_NUMBER');
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

        await this.carritoRepository.delete({ usuario: { id: usuarioId } });

        return { whatsappUrl: url, total, cantidadItems: items.length };
    }
}
