import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  estaLogueado = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    this.estaLogueado.set(!!localStorage.getItem('token'));
  }

  register(nombre: string, email: string, password: string) {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/register`, { nombre, email, password });
  }

  login(email: string, password: string) {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.access_token);
        this.estaLogueado.set(true);
      })
    );
  }

  getRol(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.rol;
  }

  getNombreUsuario(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nombre ?? payload.email ?? null;
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.estaLogueado.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
