import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './pago.entity';
import { Venta } from '../ventas/venta.entity';

const METODOS_VALIDOS = ['efectivo', 'nequi', 'daviplata'];

@Injectable()
export class PagosService {
    constructor(
        @InjectRepository(Pago) private pagoRepo: Repository<Pago>,
        @InjectRepository(Venta) private ventaRepo: Repository<Venta>,
    ) {}

    async getByVenta(ventaId: number) {
        return this.pagoRepo.find({
            where: { venta: { id: ventaId } },
            order: { fecha: 'DESC' },
        });
    }

    async registrar(ventaId: number, monto: number, metodo: string, notas?: string) {
        const venta = await this.ventaRepo.findOne({ where: { id: ventaId } });
        if (!venta) throw new NotFoundException('Venta no encontrada');
        if (venta.estado !== 'confirmada') {
            throw new BadRequestException('Solo se pueden registrar pagos en ventas confirmadas');
        }
        if (!METODOS_VALIDOS.includes(metodo)) {
            throw new BadRequestException('Método de pago inválido');
        }
        if (!monto || monto <= 0) {
            throw new BadRequestException('El monto debe ser mayor a cero');
        }

        const saldoActual = Number(venta.total) - Number(venta.montoPagado);
        if (monto > saldoActual + 0.01) {
            throw new BadRequestException(
                `El monto (${monto}) supera el saldo pendiente (${saldoActual.toFixed(0)})`
            );
        }

        const pago = this.pagoRepo.create({ venta, monto, metodo, notas });
        await this.pagoRepo.save(pago);

        venta.montoPagado = Number(venta.montoPagado) + Number(monto);
        await this.ventaRepo.save(venta);

        return { ...pago, venta: undefined };
    }

    async eliminar(id: number) {
        const pago = await this.pagoRepo.findOne({
            where: { id },
            relations: { venta: true },
        });
        if (!pago) throw new NotFoundException('Pago no encontrado');

        const venta = pago.venta;
        venta.montoPagado = Math.max(Number(venta.montoPagado) - Number(pago.monto), 0);
        await this.ventaRepo.save(venta);
        await this.pagoRepo.remove(pago);
    }

    async getPagosPorMetodo(metodo: string, desde?: string, hasta?: string) {
        const qb = this.pagoRepo.createQueryBuilder('p')
            .leftJoinAndSelect('p.venta', 'v')
            .where('p.metodo = :metodo', { metodo });

        if (desde) qb.andWhere('p.fecha >= :desde', { desde: desde + ' 00:00:00' });
        if (hasta) qb.andWhere('p.fecha <= :hasta', { hasta: hasta + ' 23:59:59' });

        qb.orderBy('p.fecha', 'DESC');
        const pagos = await qb.getMany();

        return pagos.map(p => ({
            id: p.id,
            monto: Number(p.monto),
            metodo: p.metodo,
            fecha: p.fecha,
            notas: p.notas ?? null,
            ventaId: p.venta?.id ?? null,
            ventaNumero: p.venta?.numero ?? null,
            clienteNombre: p.venta?.clienteNombre ?? null,
        }));
    }

    async getResumenCaja(desde?: string, hasta?: string) {
        const qb = this.pagoRepo.createQueryBuilder('p');

        if (desde) qb.andWhere('p.fecha >= :desde', { desde: desde + ' 00:00:00' });
        if (hasta) qb.andWhere('p.fecha <= :hasta', { hasta: hasta + ' 23:59:59' });

        const pagos = await qb.getMany();

        const porMetodo: Record<string, number> = { efectivo: 0, nequi: 0, daviplata: 0 };
        let totalCobrado = 0;

        for (const p of pagos) {
            const monto = Number(p.monto);
            porMetodo[p.metodo] = (porMetodo[p.metodo] ?? 0) + monto;
            totalCobrado += monto;
        }

        // Saldo pendiente total (todas las ventas confirmadas con saldo)
        const ventasConSaldo = await this.ventaRepo
            .createQueryBuilder('v')
            .where('v.estado = :estado', { estado: 'confirmada' })
            .andWhere('v.montoPagado < v.total')
            .getMany();

        const totalPendiente = ventasConSaldo.reduce(
            (s, v) => s + (Number(v.total) - Number(v.montoPagado)),
            0,
        );

        return { totalCobrado, porMetodo, totalPendiente, numPagos: pagos.length };
    }
}
