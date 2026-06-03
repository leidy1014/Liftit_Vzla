import { Categoria } from '../categorias/categoria.interface';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  costo: number;
  stock: number;
  stockMinimo: number;
  referencia?: string;
  marca?: string;
  codigoBarras?: string;
  activo: boolean;
  imagen?: string;
  categoria?: Categoria;
}
