import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Gasto {
    id: number;
    descripcion: string;
    monto: number;
    categoria: string;
    metodoPago: string;
    fecha: string;
    creadoEn: string;
}

export interface ResumenGastos {
    total: number;
    porCategoria: Record<string, number>;
    porMetodo: Record<string, number>;
    cantidad: number;
}

export const CATEGORIAS_GASTO = [
    'Alquiler', 'Servicios públicos', 'Nómina', 'Marketing',
    'Transporte', 'Empaques', 'Impuestos', 'Varios',
];

export const COLORES_CATEGORIA: Record<string, string> = {
    'Alquiler':           '#6a1b9a',
    'Servicios públicos': '#1565c0',
    'Nómina':             '#2e7d32',
    'Marketing':          '#c62828',
    'Transporte':         '#e65100',
    'Empaques':           '#00695c',
    'Impuestos':          '#4e342e',
    'Varios':             '#546e7a',
};

@Injectable({ providedIn: 'root' })
export class GastosService {
    private apiUrl = `${environment.apiUrl}/gastos`;

    constructor(private http: HttpClient) {}

    getAll(desde?: string, hasta?: string): Observable<Gasto[]> {
        let params = '';
        if (desde) params += `?desde=${desde}`;
        if (hasta) params += `${params ? '&' : '?'}hasta=${hasta}`;
        return this.http.get<Gasto[]>(`${this.apiUrl}${params}`);
    }

    getResumen(desde?: string, hasta?: string): Observable<ResumenGastos> {
        let params = '';
        if (desde) params += `?desde=${desde}`;
        if (hasta) params += `${params ? '&' : '?'}hasta=${hasta}`;
        return this.http.get<ResumenGastos>(`${this.apiUrl}/resumen${params}`);
    }

    crear(dto: Omit<Gasto, 'id' | 'creadoEn'>): Observable<Gasto> {
        return this.http.post<Gasto>(this.apiUrl, dto);
    }

    actualizar(id: number, dto: Omit<Gasto, 'id' | 'creadoEn'>): Observable<Gasto> {
        return this.http.put<Gasto>(`${this.apiUrl}/${id}`, dto);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
