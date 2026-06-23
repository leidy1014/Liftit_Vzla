import { Categoria } from '../categorias/categoria.interface';

export interface Producto {
  id: number;
  orden?: number;
  nombre: string;
  calificacionPromedio?: number;
  totalResenas?: number;
  descripcion: string;
  precio: number;
  precioAnterior?: number;
  costo: number;
  stock: number;
  stockMinimo: number;
  referencia?: string;
  marca?: string;
  codigoBarras?: string;
  activo: boolean;
  imagen?: string;
  imagenes?: string[];
  categoria?: Categoria;
}
