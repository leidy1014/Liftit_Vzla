import { Repository } from 'typeorm';
import { Resena } from './resena.entity';
export declare class ResenasService {
    private readonly resenaRepo;
    constructor(resenaRepo: Repository<Resena>);
    getByProducto(productoId: number): Promise<Resena[]>;
    getResumen(): Promise<{
        productoId: number;
        promedio: number;
        total: number;
    }[]>;
    crear(usuarioId: number, productoId: number, puntuacion: number, comentario?: string): Promise<Resena>;
}
