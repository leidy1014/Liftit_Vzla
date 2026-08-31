import { Categoria } from '../categorias/categoria.entity';
export declare class Producto {
    id: number;
    nombre: string;
    descripcion: string;
    orden: number;
    visitas: number;
    precioDolar: number;
    precioBolivares: number;
    stock: number;
    stockAverias: number;
    activo: boolean;
    costo: number;
    referencia: string;
    marca: string;
    codigoBarras: string;
    stockMinimo: number;
    slug: string;
    imagen: string;
    imagenes: string[];
    categorias: Categoria[];
}
