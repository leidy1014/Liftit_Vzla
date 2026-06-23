import { Producto } from '../productos/producto.entity';
import { Usuario } from '../usuarios/usuario.entity';
export declare class Resena {
    id: number;
    puntuacion: number;
    comentario: string;
    creadoEn: Date;
    producto: Producto;
    usuario: Usuario;
}
