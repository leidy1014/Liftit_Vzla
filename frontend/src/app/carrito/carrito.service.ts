import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CarritoItem } from './carrito.interface';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private apiUrl = `${environment.apiUrl}/carrito`;

  constructor(private http: HttpClient) {}

  getCarrito(): Observable<CarritoItem[]> {
    return this.http.get<CarritoItem[]>(this.apiUrl);
  }

  agregarItem(productoId: number, cantidad: number): Observable<CarritoItem> {
    return this.http.post<CarritoItem>(`${this.apiUrl}/items`, { productoId, cantidad });
  }

  actualizarItem(id: number, cantidad: number): Observable<CarritoItem> {
    return this.http.patch<CarritoItem>(`${this.apiUrl}/items/${id}`, { cantidad });
  }

  eliminarItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${id}`);
  }

  checkout(): Observable<{ numero: string; total: number; cantidadItems: number }> {
    return this.http.post<{ numero: string; total: number; cantidadItems: number }>(`${this.apiUrl}/checkout`, {});
  }
}
