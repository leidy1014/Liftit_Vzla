import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Movimiento } from './movimiento.entity';
import { Producto } from '../productos/producto.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class InventarioService {

    constructor(
        @InjectRepository(Movimiento)
        private movimientoRepo: Repository<Movimiento>,
        @InjectRepository(Producto)
        private productoRepo: Repository<Producto>,
    ) {}

    // ─── RECEPCIONES ────────────────────────────────────────────────────────────

    async registrarRecepcion(productoId: number, cantidad: number, motivo?: string) {
        const producto = await this.productoRepo.findOne({ where: { id: productoId } });
        if (!producto) throw new NotFoundException(`Producto #${productoId} no encontrado`);
        if (cantidad <= 0) throw new BadRequestException('La cantidad debe ser mayor a 0');

        producto.stock += cantidad;
        await this.productoRepo.save(producto);

        const movimiento = this.movimientoRepo.create({
            producto,
            tipo: 'recepcion',
            cantidad,
            motivo,
            ubicacionDestino: 'principal',
            stockPrincipalDespues: producto.stock,
            stockAveriasDespues: producto.stockAverias,
        });
        return this.movimientoRepo.save(movimiento);
    }

    // ─── MOVIMIENTOS INTERNOS ────────────────────────────────────────────────────

    async registrarMovimientoInterno(
        productoId: number,
        origen: 'principal' | 'averias',
        destino: 'principal' | 'averias',
        cantidad: number,
        motivo?: string,
    ) {
        if (origen === destino) throw new BadRequestException('El origen y destino deben ser diferentes');

        const producto = await this.productoRepo.findOne({ where: { id: productoId } });
        if (!producto) throw new NotFoundException(`Producto #${productoId} no encontrado`);

        const stockOrigen = origen === 'principal' ? producto.stock : producto.stockAverias;
        if (stockOrigen < cantidad) {
            throw new BadRequestException(`Stock insuficiente en ${origen === 'principal' ? 'Principal' : 'Averías'}`);
        }

        if (origen === 'principal') {
            producto.stock -= cantidad;
            producto.stockAverias += cantidad;
        } else {
            producto.stockAverias -= cantidad;
            producto.stock += cantidad;
        }
        await this.productoRepo.save(producto);

        const movimiento = this.movimientoRepo.create({
            producto,
            tipo: 'movimiento_interno',
            cantidad,
            motivo,
            ubicacionOrigen: origen,
            ubicacionDestino: destino,
            stockPrincipalDespues: producto.stock,
            stockAveriasDespues: producto.stockAverias,
        });
        return this.movimientoRepo.save(movimiento);
    }

    // ─── EXISTENCIAS (REPORTE) ───────────────────────────────────────────────────

    async getExistencias() {
        const productos = await this.productoRepo.find({
            relations: { categoria: true },
            order: { nombre: 'ASC' },
        });

        return productos.map(p => ({
            id: p.id,
            nombre: p.nombre,
            referencia: p.referencia,
            marca: p.marca,
            imagen: p.imagen,
            categoria: p.categoria,
            costo: Number(p.costo),
            precio: Number(p.precio),
            stock: p.stock,
            stockAverias: p.stockAverias,
            stockTotal: p.stock + p.stockAverias,
            stockMinimo: p.stockMinimo,
            valorTotal: Number(p.costo) * (p.stock + p.stockAverias),
            margen: p.precio > 0 && p.costo > 0
                ? Math.round(((Number(p.precio) - Number(p.costo)) / Number(p.precio)) * 100)
                : null,
        }));
    }

    // ─── KARDEX (para gráfica y tabla) ──────────────────────────────────────────

    async getKardex(productoId: number) {
        const producto = await this.productoRepo.findOne({
            where: { id: productoId },
            relations: { categoria: true },
        });
        if (!producto) throw new NotFoundException(`Producto #${productoId} no encontrado`);

        const movimientos = await this.movimientoRepo.find({
            where: { producto: { id: productoId } },
            order: { fecha: 'ASC' },
        });

        return {
            producto: {
                id: producto.id,
                nombre: producto.nombre,
                stock: producto.stock,
                stockAverias: producto.stockAverias,
                costo: Number(producto.costo),
                precio: Number(producto.precio),
                stockMinimo: producto.stockMinimo,
            },
            movimientos,
        };
    }

    // ─── RECEPCIONES RECIENTES ───────────────────────────────────────────────────

    getRecepciones() {
        return this.movimientoRepo.find({
            where: { tipo: 'recepcion' },
            relations: { producto: true },
            order: { fecha: 'DESC' },
            take: 20,
        });
    }

    getMovimientosInternos() {
        return this.movimientoRepo.find({
            where: { tipo: 'movimiento_interno' },
            relations: { producto: true },
            order: { fecha: 'DESC' },
            take: 20,
        });
    }
}
