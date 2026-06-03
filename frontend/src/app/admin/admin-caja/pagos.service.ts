import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pago } from '../admin-ventas/venta.interface';
import { environment } from '../../../environments/environment';

export interface ResumenCaja {
    totalCobrado: number;
    porMetodo: { efectivo: number; nequi: number; daviplata: number };
    totalPendiente: number;
    numPagos: number;
}

export interface PagoDetalle {
    id: number;
    monto: number;
    metodo: string;
    fecha: string;
    notas: string | null;
    ventaId: number | null;
    ventaNumero: string | null;
    clienteNombre: string | null;
}

@Injectable({ providedIn: 'root' })
export class PagosService {
    private apiUrl = `${environment.apiUrl}/pagos`;

    constructor(private http: HttpClient) {}

    getByVenta(ventaId: number): Observable<Pago[]> {
        return this.http.get<Pago[]>(`${this.apiUrl}/venta/${ventaId}`);
    }

    registrar(ventaId: number, monto: number, metodo: string, notas?: string): Observable<Pago> {
        return this.http.post<Pago>(this.apiUrl, { ventaId, monto, metodo, notas });
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getResumenCaja(desde?: string, hasta?: string): Observable<ResumenCaja> {
        let params = '';
        if (desde) params += `?desde=${desde}`;
        if (hasta) params += `${params ? '&' : '?'}hasta=${hasta}`;
        return this.http.get<ResumenCaja>(`${this.apiUrl}/resumen${params}`);
    }

    getByMetodo(metodo: string, desde: string, hasta: string): Observable<PagoDetalle[]> {
        return this.http.get<PagoDetalle[]>(`${this.apiUrl}/metodo/${metodo}?desde=${desde}&hasta=${hasta}`);
    }
}
