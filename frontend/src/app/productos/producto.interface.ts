import { Categoria } from '../categorias/categoria.interface';

export interface Producto {
  id: number;
  slug?: string;
  orden?: number;
  nombre: string;
  calificacionPromedio?: number;
  totalResenas?: number;
  descripcion: string;
  precioDolar: number;
  precioBolivares?: number;
  costo: number;
  stock: number;
  stockMinimo: number;
  referencia?: string;
  marca?: string;
  codigoBarras?: string;
  activo: boolean;
  imagen?: string;
  imagenes?: string[];
  categorias?: Categoria[];
}
