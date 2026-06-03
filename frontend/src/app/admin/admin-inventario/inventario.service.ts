import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movimiento, Existencia, KardexDetalle } from './movimiento.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventarioService {
    private apiUrl = `${environment.apiUrl}/inventario`;

    constructor(private http: HttpClient) {}

    getExistencias(): Observable<Existencia[]> {
        return this.http.get<Existencia[]>(`${this.apiUrl}/existencias`);
    }

    getKardex(productoId: number): Observable<KardexDetalle> {
        return this.http.get<KardexDetalle>(`${this.apiUrl}/kardex/${productoId}`);
    }

    getRecepciones(): Observable<Movimiento[]> {
        return this.http.get<Movimiento[]>(`${this.apiUrl}/recepciones`);
    }

    getMovimientosInternos(): Observable<Movimiento[]> {
        return this.http.get<Movimiento[]>(`${this.apiUrl}/movimientos-internos`);
    }

    registrarRecepcion(productoId: number, cantidad: number, motivo?: string) {
        return this.http.post(`${this.apiUrl}/recepciones`, { productoId, cantidad, motivo });
    }

    registrarMovimientoInterno(
        productoId: number,
        origen: string,
        destino: string,
        cantidad: number,
        motivo?: string,
    ) {
        return this.http.post(`${this.apiUrl}/movimientos-internos`, {
            productoId, origen, destino, cantidad, motivo,
        });
    }
}
