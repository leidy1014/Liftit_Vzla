import { Injectable, signal } from '@angular/core';
import { CarritoItem } from './carrito.interface';

const STORAGE_KEY = 'liftit_carrito';
const WHATSAPP_NUMBER = '584128349722';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private _items = signal<CarritoItem[]>(this.leerStorage());

  readonly items = this._items.asReadonly();

  private leerStorage(): CarritoItem[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private guardar(items: CarritoItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    this._items.set(items);
  }

  cantidadTotal(): number {
    return this._items().reduce((sum, i) => sum + i.cantidad, 0);
  }

  agregar(producto: { id: number; nombre: string; precioDolar: number; stock: number; imagen?: string | null }, cantidad = 1) {
    const actuales = this._items();
    const idx = actuales.findIndex(i => i.productoId === producto.id);
    const maxStock = producto.stock > 0 ? producto.stock : 99;

    if (idx >= 0) {
      const nuevos = [...actuales];
      const nueva = Math.min(nuevos[idx].cantidad + cantidad, maxStock);
      nuevos[idx] = { ...nuevos[idx], cantidad: nueva };
      this.guardar(nuevos);
    } else {
      this.guardar([...actuales, {
        productoId: producto.id,
        nombre: producto.nombre,
        precioDolar: producto.precioDolar,
        stock: producto.stock,
        imagen: producto.imagen ?? null,
        cantidad,
      }]);
    }
  }

  actualizar(productoId: number, cantidad: number) {
    this.guardar(this._items().map(i => i.productoId === productoId ? { ...i, cantidad } : i));
  }

  eliminar(productoId: number) {
    this.guardar(this._items().filter(i => i.productoId !== productoId));
  }

  limpiar() {
    this.guardar([]);
  }

  generarUrlWhatsapp(): string {
    const items = this._items();
    const lineas = items.map(i =>
      `- *${i.nombre}* x${i.cantidad} → $${(i.precioDolar * i.cantidad).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
    ).join('\n');
    const total = items.reduce((sum, i) => sum + i.precioDolar * i.cantidad, 0);
    const mensaje = `Hola! Deseo realizar este pedido:\n\n${lineas}\n\n*Total: $${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD*\n\n¿Está disponible?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  }
}
