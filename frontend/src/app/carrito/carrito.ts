import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoItem } from './carrito.interface';
import { CarritoService } from './carrito.service';
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

  items = this.carritoService.items;
  procesando = signal(false);
  pedidoEnviado = signal(false);
  whatsappUrl = signal('');

  imagenUrl(imagen: string): string {
    return `${environment.uploadsUrl}/${imagen}`;
  }

  calcularTotal(): number {
    return this.items().reduce((total, i) => total + i.cantidad * i.precio, 0);
  }

  aumentar(item: CarritoItem) {
    if (item.cantidad >= item.stock) {
      this.toast.error(`Solo hay ${item.stock} unidades disponibles de "${item.nombre}"`);
      return;
    }
    this.carritoService.actualizar(item.productoId, item.cantidad + 1);
  }

  disminuir(item: CarritoItem) {
    if (item.cantidad <= 1) return;
    this.carritoService.actualizar(item.productoId, item.cantidad - 1);
  }

  eliminar(productoId: number) {
    this.carritoService.eliminar(productoId);
    this.toast.exito('Producto eliminado del carrito');
  }

  confirmarPedido() {
    const url = this.carritoService.generarUrlWhatsapp();
    this.whatsappUrl.set(url);
    this.carritoService.limpiar();
    this.pedidoEnviado.set(true);
    window.open(url, '_blank');
  }
}
