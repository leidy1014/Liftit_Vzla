import { Categoria } from '../categorias/categoria.entity';
export declare class Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    stockAverias: number;
    activo: boolean;
    costo: number;
    referencia: string;
    marca: string;
    codigoBarras: string;
    stockMinimo: number;
    imagen: string;
    imagenes: string[];
    categoria: Categoria;
}
