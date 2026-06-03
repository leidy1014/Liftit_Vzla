import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compra, NuevaCompraDto, Proveedor, ProveedorHistorial } from './compra.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComprasService {
    private baseCompras = `${environment.apiUrl}/compras`;
    private baseProveedores = `${environment.apiUrl}/proveedores`;

    constructor(private http: HttpClient) {}

    // ── Proveedores ──
    getProveedores(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(this.baseProveedores);
    }

    crearProveedor(data: Partial<Proveedor>): Observable<Proveedor> {
        return this.http.post<Proveedor>(this.baseProveedores, data);
    }

    actualizarProveedor(id: number, data: Partial<Proveedor>): Observable<Proveedor> {
        return this.http.put<Proveedor>(`${this.baseProveedores}/${id}`, data);
    }

    eliminarProveedor(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseProveedores}/${id}`);
    }

    borrarProveedorPermanente(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseProveedores}/${id}/permanente`);
    }

    // ── Compras ──
    getAll(): Observable<Compra[]> {
        return this.http.get<Compra[]>(this.baseCompras);
    }

    getById(id: number): Observable<Compra> {
        return this.http.get<Compra>(`${this.baseCompras}/${id}`);
    }

    crear(dto: NuevaCompraDto): Observable<Compra> {
        return this.http.post<Compra>(this.baseCompras, dto);
    }

    actualizar(id: number, dto: NuevaCompraDto): Observable<Compra> {
        return this.http.put<Compra>(`${this.baseCompras}/${id}`, dto);
    }

    recibir(id: number): Observable<Compra> {
        return this.http.post<Compra>(`${this.baseCompras}/${id}/recibir`, {});
    }

    cancelar(id: number): Observable<Compra> {
        return this.http.post<Compra>(`${this.baseCompras}/${id}/cancelar`, {});
    }

    getHistorialProveedor(id: number): Observable<ProveedorHistorial> {
        return this.http.get<ProveedorHistorial>(`${this.baseCompras}/proveedor/${id}`);
    }
}
