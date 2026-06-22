import { Producto } from '../productos/producto.entity';
import { Usuario } from '../usuarios/usuario.entity';
export declare class CarritoItem {
    id: number;
    cantidad: number;
    usuario: Usuario;
    producto: Producto;
}
