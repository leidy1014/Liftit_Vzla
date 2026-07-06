import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoItem } from './carrito.interface';
import { CarritoService } from './carrito.service';
import { AuthService } from '../auth/auth';
import { environment } from '../../environments/environment';
import { Navbar } from '../shared/navbar/navbar';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  selector: 'app-carrito',
  imports: [CurrencyPipe, RouterModule, Navbar],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  private carritoService = inject(CarritoService);
  private toast = inject(ToastService);
  public authService = inject(AuthService);

  items = this.carritoService.items;
  procesando = signal(false);
  pedidoEnviado = signal(false);
  whatsappUrl = signal('');
  pedidoItems = signal<CarritoItem[]>([]);
  pedidoTotal = signal(0);

  imagenUrl(imagen: string): string {
    return `${environment.uploadsUrl}/${imagen}`;
  }

  calcularTotal(): number {
    return this.items().reduce((total, i) => total + i.cantidad * i.precio, 0);
  }

  maxStock(item: CarritoItem): number {
    return item.stock > 0 ? item.stock : 99;
  }

  aumentar(item: CarritoItem) {
    if (item.cantidad >= this.maxStock(item)) {
      this.toast.error(`Máximo ${this.maxStock(item)} unidades disponibles`);
      return;
    }
    this.carritoService.actualizar(item.productoId, item.cantidad + 1);
  }

  disminuir(item: CarritoItem) {
    if (item.cantidad <= 1) return;
    this.carritoService.actualizar(item.productoId, item.cantidad - 1);
  }

  setCantidad(item: CarritoItem, valor: string) {
    const n = parseInt(valor, 10);
    if (isNaN(n) || n < 1) {
      this.carritoService.actualizar(item.productoId, 1);
      return;
    }
    const max = this.maxStock(item);
    this.carritoService.actualizar(item.productoId, Math.min(n, max));
  }

  eliminar(productoId: number) {
    this.carritoService.eliminar(productoId);
    this.toast.exito('Producto eliminado del carrito');
  }

  confirmarPedido() {
    const url = this.carritoService.generarUrlWhatsapp();
    this.pedidoItems.set([...this.items()]);
    this.pedidoTotal.set(this.calcularTotal());
    this.whatsappUrl.set(url);
    this.carritoService.limpiar();
    this.pedidoEnviado.set(true);
    window.open(url, '_blank');
  }
}
