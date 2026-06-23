import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resena } from './resena.entity';

@Injectable()
export class ResenasService {
  constructor(
    @InjectRepository(Resena)
    private readonly resenaRepo: Repository<Resena>,
  ) {}

  getByProducto(productoId: number): Promise<Resena[]> {
    return this.resenaRepo.find({
      where: { producto: { id: productoId } },
      relations: { usuario: true },
      order: { creadoEn: 'DESC' },
    });
  }

  async getResumen(): Promise<{ productoId: number; promedio: number; total: number }[]> {
    const rows = await this.resenaRepo.query(`
      SELECT producto_id AS "productoId",
             ROUND(AVG(puntuacion)::numeric, 1)::float AS promedio,
             COUNT(id)::int AS total
      FROM resenas
      GROUP BY producto_id
    `);
    return rows;
  }

  async crear(usuarioId: number, productoId: number, puntuacion: number, comentario?: string): Promise<Resena> {
    const existe = await this.resenaRepo.findOne({
      where: { producto: { id: productoId }, usuario: { id: usuarioId } },
    });
    if (existe) throw new ConflictException('Ya dejaste una reseña para este producto');
    const resena = this.resenaRepo.create({
      puntuacion,
      comentario,
      producto: { id: productoId } as any,
      usuario: { id: usuarioId } as any,
    });
    return this.resenaRepo.save(resena);
  }
}
