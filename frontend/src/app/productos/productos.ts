import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { Producto } from './producto.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private apiUrl = `${environment.apiUrl}/productos`;
  private cache$: Observable<Producto[]> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Producto[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<Producto[]>(this.apiUrl).pipe(shareReplay(1));
    }
    return this.cache$;
  }

  invalidarCache() {
    this.cache$ = null;
  }

  getById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  getBySlug(slug: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/slug/${slug}`);
  }

  create(data: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, data).pipe(
      tap(() => this.invalidarCache())
    );
  }

  update(id: number, data: Partial<Producto>): Observable<Producto> {
    return this.http.patch<Producto>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.invalidarCache())
    );
  }

  uploadImagen(file: File): Observable<{ filename: string }> {
    const formData = new FormData();
    formData.append('imagen', file);
    return this.http.post<{ filename: string }>(`${this.apiUrl}/upload`, formData);
  }

  reordenar(ids: number[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/reordenar`, { ids }).pipe(
      tap(() => this.invalidarCache())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.invalidarCache())
    );
  }

  agregarImagen(id: number, file: File): Observable<Producto> {
    const formData = new FormData();
    formData.append('imagen', file);
    return this.http.post<Producto>(`${this.apiUrl}/${id}/imagenes`, formData).pipe(
      tap(() => this.invalidarCache())
    );
  }

  eliminarImagen(id: number, filename: string): Observable<Producto> {
    return this.http.delete<Producto>(`${this.apiUrl}/${id}/imagenes/${filename}`).pipe(
      tap(() => this.invalidarCache())
    );
  }
}
