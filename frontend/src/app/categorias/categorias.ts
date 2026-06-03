import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Categoria } from './categoria.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Categorias {
  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  create(data: Partial<Categoria>): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, data);
  }
  
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
