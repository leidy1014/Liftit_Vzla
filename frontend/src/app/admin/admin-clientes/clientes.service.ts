import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cliente } from './cliente.interface';

@Injectable({ providedIn: 'root' })
export class ClientesService {
    private url = `${environment.apiUrl}/clientes`;

    constructor(private http: HttpClient) {}

    getAll() {
        return this.http.get<Cliente[]>(this.url);
    }

    crear(data: Partial<Cliente>) {
        return this.http.post<Cliente>(this.url, data);
    }

    actualizar(id: number, data: Partial<Cliente>) {
        return this.http.put<Cliente>(`${this.url}/${id}`, data);
    }

    eliminar(id: number) {
        return this.http.delete(`${this.url}/${id}`);
    }

    borrarPermanente(id: number) {
        return this.http.delete(`${this.url}/${id}/permanente`);
    }
}
