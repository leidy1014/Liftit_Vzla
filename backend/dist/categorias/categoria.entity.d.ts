import { Producto } from '../productos/producto.entity';
export declare class Categoria {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    productos: Producto[];
}
