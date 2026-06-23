export interface Resena {
  id: number;
  puntuacion: number;
  comentario?: string;
  creadoEn: string;
  usuario: { id: number; nombre: string };
}

export interface ResenaResumen {
  productoId: number;
  promedio: number;
  total: number;
}
