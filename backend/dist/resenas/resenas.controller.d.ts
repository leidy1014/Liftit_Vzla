import { ResenasService } from './resenas.service';
export declare class ResenasController {
    private readonly resenasService;
    constructor(resenasService: ResenasService);
    getResumen(): Promise<{
        productoId: number;
        promedio: number;
        total: number;
    }[]>;
    getByProducto(id: number): Promise<import("./resena.entity").Resena[]>;
    crear(req: any, body: {
        productoId: number;
        puntuacion: number;
        comentario?: string;
    }): Promise<import("./resena.entity").Resena>;
}
