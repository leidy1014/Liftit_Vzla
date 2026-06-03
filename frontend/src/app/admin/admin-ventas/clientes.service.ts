import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteVenta } from './venta.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientesService {
    private apiUrl = `${environment.apiUrl}/clientes`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<ClienteVenta[]> {
        return this.http.get<ClienteVenta[]>(this.apiUrl);
    }

    crear(data: Partial<ClienteVenta>): Observable<ClienteVenta> {
        return this.http.post<ClienteVenta>(this.apiUrl, data);
    }

    actualizar(id: number, data: Partial<ClienteVenta>): Observable<ClienteVenta> {
        return this.http.put<ClienteVenta>(`${this.apiUrl}/${id}`, data);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    borrarPermanente(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}/permanente`);
    }
}
