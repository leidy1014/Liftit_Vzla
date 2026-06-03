import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta, NuevaVentaDto } from './venta.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VentasService {
    private apiUrl = `${environment.apiUrl}/ventas`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<Venta[]> {
        return this.http.get<Venta[]>(this.apiUrl);
    }

    getById(id: number): Observable<Venta> {
        return this.http.get<Venta>(`${this.apiUrl}/${id}`);
    }

    getByCliente(clienteId: number): Observable<Venta[]> {
        return this.http.get<Venta[]>(`${this.apiUrl}/cliente/${clienteId}`);
    }

    crear(dto: NuevaVentaDto): Observable<Venta> {
        return this.http.post<Venta>(this.apiUrl, dto);
    }

    actualizar(id: number, dto: NuevaVentaDto): Observable<Venta> {
        return this.http.put<Venta>(`${this.apiUrl}/${id}`, dto);
    }

    anular(id: number): Observable<Venta> {
        return this.http.post<Venta>(`${this.apiUrl}/${id}/anular`, {});
    }

    reactivar(id: number): Observable<Venta> {
        return this.http.post<Venta>(`${this.apiUrl}/${id}/reactivar`, {});
    }

    confirmar(id: number): Observable<Venta> {
        return this.http.post<Venta>(`${this.apiUrl}/${id}/confirmar`, {});
    }

    cancelar(id: number): Observable<Venta> {
        return this.http.post<Venta>(`${this.apiUrl}/${id}/cancelar`, {});
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
