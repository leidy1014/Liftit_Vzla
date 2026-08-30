export class CreateProductoDto {
  nombre: string;
  descripcion?: string;
  precio: number;
  precioAnterior?: number;
  activo?: boolean;
  costo?: number;
  stock?: number;
  stockMinimo?: number;
  referencia?: string;
  marca?: string;
  codigoBarras?: string;
  categoriaIds?: number[];
  imagen?: string;
}
