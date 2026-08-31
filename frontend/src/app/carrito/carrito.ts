import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoItem } from './carrito.interface';
import { CarritoService } from './carrito.service';
import { AuthService } from '../auth/auth';
import { environment } from '../../environments/environment';
import { Navbar } from '../shared/navbar/navbar';
import { ToastService } from '../shared/toast/toast.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    return this.items().reduce((total, i) => total + i.cantidad * i.precioDolar, 0);
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

  private formatUSD(valor: number): string {
    return valor.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
  }

  descargarCotizacion() {
    const items = this.items();
    if (!items.length) return;

    const doc = new jsPDF();
    const total = this.calcularTotal();
    const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const numero = `COT-${Date.now().toString().slice(-6)}`;
    const nombreUsuario = this.authService.getNombreUsuario();

    // ── Encabezado ──────────────────────────────────────────────
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('LIFTIT FITNESS', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Equipamiento Deportivo Profesional', 14, 23);
    doc.text('liftitcolombia@gmail.com  ·  +58 412 834 9722', 14, 30);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('COTIZACIÓN', 196, 16, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° ${numero}`, 196, 23, { align: 'right' });
    doc.text(`Fecha: ${fecha}`, 196, 30, { align: 'right' });

    // ── Datos del cliente ────────────────────────────────────────
    doc.setTextColor(30, 30, 30);
    let cursorY = 50;

    if (nombreUsuario) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('COTIZACIÓN PARA:', 14, cursorY);
      doc.setFont('helvetica', 'normal');
      doc.text(nombreUsuario, 14, cursorY + 6);
      cursorY += 18;
    }

    // ── Tabla de productos ───────────────────────────────────────
    autoTable(doc, {
      startY: cursorY,
      head: [['Producto', 'Cant.', 'Precio unitario', 'Subtotal']],
      body: items.map(i => [
        i.nombre,
        String(i.cantidad),
        this.formatUSD(i.precioDolar),
        this.formatUSD(i.cantidad * i.precioDolar),
      ]),
      foot: [['', '', 'TOTAL', this.formatUSD(total)]],
      headStyles: { fillColor: [15, 15, 15], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      footStyles: { fillColor: [240, 240, 240], textColor: [15, 15, 15], fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { halign: 'center', cellWidth: 18 },
        2: { halign: 'right', cellWidth: 42 },
        3: { halign: 'right', cellWidth: 42 },
      },
      alternateRowStyles: { fillColor: [248, 248, 248] },
    });

    // ── Nota al pie ──────────────────────────────────────────────
    const finalY: number = (doc as any).lastAutoTable.finalY + 12;
    doc.setDrawColor(220, 220, 220);
    doc.line(14, finalY - 4, 196, finalY - 4);

    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text('• Esta cotización tiene una validez de 15 días hábiles.', 14, finalY);
    doc.text('• Los precios están expresados en dólares americanos (USD).', 14, finalY + 5);
    doc.text('• Para confirmar tu pedido comunícate por WhatsApp al +57 321 332 4759.', 14, finalY + 10);

    doc.save(`cotizacion-liftit-${numero}.pdf`);
  }
}
