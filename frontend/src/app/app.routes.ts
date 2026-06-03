import { Routes } from '@angular/router';
import { ProductosLista } from './productos/productos-lista/productos-lista';
import { Login } from './auth/login/login';
import { authGuard } from './auth/auth-guard';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { AdminCategorias } from './admin/admin-categorias/admin-categorias';
import { AdminProductos } from './admin/admin-productos/admin-productos';
import { Carrito } from './carrito/carrito';
import { adminGuard } from './auth/role-guard';
import { AdminInventario } from './admin/admin-inventario/admin-inventario';
import { AdminVentas } from './admin/admin-ventas/admin-ventas';
import { AdminCompras } from './admin/admin-compras/admin-compras';
import { AdminClientes } from './admin/admin-clientes/admin-clientes';
import { Register } from './auth/register/register';
import { ProductoDetalle } from './productos/producto-detalle/producto-detalle';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { AdminReportes } from './admin/admin-reportes/admin-reportes';
import { AdminCaja } from './admin/admin-caja/admin-caja';
import { AdminGastos } from './admin/admin-gastos/admin-gastos';

export const routes: Routes = [
  { path: 'productos', component: ProductosLista },
  { path: 'productos/:id', component: ProductoDetalle },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'carrito', component: Carrito, canActivate: [authGuard] },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'productos', component: AdminProductos },
      { path: 'categorias', component: AdminCategorias },
      { path: 'inventario', component: AdminInventario },
      { path: 'ventas', component: AdminVentas },
      { path: 'compras', component: AdminCompras },
      { path: 'clientes', component: AdminClientes },
      { path: 'reportes', component: AdminReportes },
      { path: 'caja', component: AdminCaja },
      { path: 'gastos', component: AdminGastos },
    ]
  },
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
];
