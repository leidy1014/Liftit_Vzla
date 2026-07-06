import { Routes } from '@angular/router';
import { ProductosLista } from './productos/productos-lista/productos-lista';
import { Login } from './auth/login/login';
import { authGuard } from './auth/auth-guard';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { AdminCategorias } from './admin/admin-categorias/admin-categorias';
import { AdminProductos } from './admin/admin-productos/admin-productos';
import { Carrito } from './carrito/carrito';
import { adminGuard } from './auth/role-guard';
import { AdminClientes } from './admin/admin-clientes/admin-clientes';
import { Register } from './auth/register/register';
import { ProductoDetalle } from './productos/producto-detalle/producto-detalle';
import { PoliticaGarantia } from './politicas/politica-garantia/politica-garantia';
import { PoliticaRetracto } from './politicas/politica-retracto/politica-retracto';
import { PoliticaPrivacidad } from './politicas/politica-privacidad/politica-privacidad';

export const routes: Routes = [
  { path: 'productos', component: ProductosLista },
  { path: 'productos/:id', component: ProductoDetalle },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'carrito', component: Carrito },
  { path: 'politica-garantia', component: PoliticaGarantia },
  { path: 'politica-retracto', component: PoliticaRetracto },
  { path: 'politica-privacidad', component: PoliticaPrivacidad },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      { path: 'productos', component: AdminProductos },
      { path: 'categorias', component: AdminCategorias },
      { path: 'clientes', component: AdminClientes },
    ]
  },
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
];
