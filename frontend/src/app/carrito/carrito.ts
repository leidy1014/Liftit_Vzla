import { Component, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoItem } from './carrito.interface';
import { CarritoService } from './carrito.service';
import { environment } from '../../environments/environment';
import { Navbar } from '../shared/navbar/navbar';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  selector: 'app-carrito',
  imports: [
    CurrencyPipe,
    RouterModule,
    Navbar,
  ],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  items = signal<CarritoItem[]>([]);
  cargando = signal(false);
  procesando = signal(false);
  pedidoConfirmado = signal<{ numero: string; total: number; whatsappUrl: string } | null>(null);

  constructor(
    private carritoService: CarritoService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.cargarCarrito();
  }

  cargarCarrito() {
    this.cargando.set(true);
    this.carritoService.getCarrito().subscribe({
      next: (items) => {
        this.items.set(items);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  aumentar(item: CarritoItem) {
    if (item.cantidad >= item.producto.stock) {
      this.toast.error(`Solo hay ${item.producto.stock} unidades disponibles de "${item.producto.nombre}"`);
      return;
    }
    this.carritoService.actualizarItem(item.id, item.cantidad + 1).subscribe({
      next: () => this.cargarCarrito(),
      error: (err) => this.toast.error(err.error?.message || 'No se pudo actualizar la cantidad'),
    });
  }

  disminuir(item: CarritoItem) {
    if (item.cantidad <= 1) return;
    this.carritoService.actualizarItem(item.id, item.cantidad - 1).subscribe(() => {
      this.cargarCarrito();
    });
  }

  eliminar(id: number) {
    this.carritoService.eliminarItem(id).subscribe({
      next: () => {
        this.toast.exito('Producto eliminado del carrito');
        this.cargarCarrito();
      },
    });
  }

  imagenUrl(imagen: string): string {
    return `${environment.apiUrl}/uploads/${imagen}`;
  }

  calcularTotal(): number {
    return this.items().reduce((total, item) => total + item.cantidad * item.producto.precio, 0);
  }

  confirmarPedido() {
    const itemsActuales = this.items();
    this.procesando.set(true);
    this.carritoService.checkout().subscribe({
      next: (res) => {
        const lineas = itemsActuales.map(i => `- ${i.producto.nombre} x${i.cantidad}`).join('\n');
        const totalFmt = res.total.toLocaleString('es-CO');
        const mensaje = `Hola Cherry Glam! 🛍️ Confirmo mi pedido *${res.numero}*:\n${lineas}\n*Total: $${totalFmt}*`;
        const whatsappUrl = `https://wa.me/573189605857?text=${encodeURIComponent(mensaje)}`;

        this.pedidoConfirmado.set({ numero: res.numero, total: res.total, whatsappUrl });
        this.items.set([]);
        this.procesando.set(false);

        window.open(whatsappUrl, '_blank');
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al procesar el pedido. Inténtalo de nuevo.');
        this.procesando.set(false);
      },
    });
  }
}
