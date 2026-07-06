import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { Resena, ResenaResumen } from './resena.interface';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResenasService {
  private apiUrl = `${environment.apiUrl}/resenas`;
  private resumenCache$: Observable<ResenaResumen[]> | null = null;

  constructor(private http: HttpClient) {}

  getResumen(): Observable<ResenaResumen[]> {
    if (!this.resumenCache$) {
      this.resumenCache$ = this.http.get<ResenaResumen[]>(`${this.apiUrl}/resumen`).pipe(shareReplay(1));
    }
    return this.resumenCache$;
  }

  getByProducto(id: number): Observable<Resena[]> {
    return this.http.get<Resena[]>(`${this.apiUrl}/producto/${id}`);
  }

  crear(dto: { productoId: number; puntuacion: number; comentario?: string }): Observable<Resena> {
    return this.http.post<Resena>(this.apiUrl, dto).pipe(
      tap(() => { this.resumenCache$ = null; })
    );
  }
}
