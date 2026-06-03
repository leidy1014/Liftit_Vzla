import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gasto } from './gasto.entity';

const CATEGORIAS = [
    'Alquiler', 'Servicios públicos', 'Nómina', 'Marketing',
    'Transporte', 'Empaques', 'Impuestos', 'Varios',
];

const METODOS = ['efectivo', 'nequi', 'daviplata', 'transferencia'];

interface GastoDto {
    descripcion: string;
    monto: number;
    categoria: string;
    metodoPago: string;
    fecha: string;
}

@Injectable()
export class GastosService {
    constructor(
        @InjectRepository(Gasto) private gastoRepo: Repository<Gasto>,
    ) {}

    async getAll(desde?: string, hasta?: string) {
        const qb = this.gastoRepo.createQueryBuilder('g').orderBy('g.fecha', 'DESC');
        if (desde) qb.andWhere('g.fecha >= :desde', { desde: desde + ' 00:00:00' });
        if (hasta) qb.andWhere('g.fecha <= :hasta', { hasta: hasta + ' 23:59:59' });
        return qb.getMany();
    }

    async crear(dto: GastoDto) {
        this.validar(dto);
        const gasto = this.gastoRepo.create(dto);
        return this.gastoRepo.save(gasto);
    }

    async actualizar(id: number, dto: GastoDto) {
        const gasto = await this.gastoRepo.findOne({ where: { id } });
        if (!gasto) throw new NotFoundException('Gasto no encontrado');
        this.validar(dto);
        Object.assign(gasto, dto);
        return this.gastoRepo.save(gasto);
    }

    async eliminar(id: number) {
        const gasto = await this.gastoRepo.findOne({ where: { id } });
        if (!gasto) throw new NotFoundException('Gasto no encontrado');
        await this.gastoRepo.remove(gasto);
    }

    async getResumen(desde?: string, hasta?: string) {
        const gastos = await this.getAll(desde, hasta);
        const total = gastos.reduce((s, g) => s + Number(g.monto), 0);

        const porCategoria: Record<string, number> = {};
        const porMetodo: Record<string, number> = {};

        for (const g of gastos) {
            porCategoria[g.categoria] = (porCategoria[g.categoria] ?? 0) + Number(g.monto);
            porMetodo[g.metodoPago] = (porMetodo[g.metodoPago] ?? 0) + Number(g.monto);
        }

        return { total, porCategoria, porMetodo, cantidad: gastos.length };
    }

    private validar(dto: GastoDto) {
        if (!dto.descripcion?.trim()) throw new BadRequestException('La descripción es obligatoria');
        if (!dto.monto || dto.monto <= 0) throw new BadRequestException('El monto debe ser mayor a cero');
        if (!dto.fecha) throw new BadRequestException('La fecha es obligatoria');
        if (!CATEGORIAS.includes(dto.categoria)) throw new BadRequestException('Categoría inválida');
        if (!METODOS.includes(dto.metodoPago)) throw new BadRequestException('Método de pago inválido');
    }
}
