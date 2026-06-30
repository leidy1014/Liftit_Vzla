import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductosService } from '../productos';
import { Producto } from '../producto.interface';
import { CarritoService } from '../../carrito/carrito.service';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { ToastService } from '../../shared/toast/toast.service';
import { ResenasService } from '../../resenas/resenas.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-productos-lista',
  imports: [CurrencyPipe, DecimalPipe, RouterModule, Navbar],
  templateUrl: './productos-lista.html',
  styleUrl: './productos-lista.css',
})
export class ProductosLista implements OnInit {
  productos = signal<Producto[]>([]);
  categoriaActiva = signal<string | null>(null);
  busqueda = signal('');
  paginaActual = signal(1);
  readonly productosPorPagina = 8;

  // Solo categorías que tienen al menos 1 producto
  categorias = computed(() => {
    const cats = this.productos()
      .map(p => p.categoria)
      .filter((c): c is NonNullable<typeof c> => !!c);
    const unicas = new Map(cats.map(c => [c.id, c]));
    return [...unicas.values()];
  });

  productosFiltrados = computed(() => {
    let lista = this.productos();
    const cat = this.categoriaActiva();
    const texto = this.busqueda().toLowerCase().trim();
    if (cat) lista = lista.filter(p => p.categoria?.nombre === cat);
    if (texto) lista = lista.filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(texto))
    );
    return lista;
  });

  totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.productosFiltrados().length / this.productosPorPagina))
  );

  productosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.productosPorPagina;
    return this.productosFiltrados().slice(inicio, inicio + this.productosPorPagina);
  });

  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService,
    private resenasService: ResenasService,
    private router: Router,
    private toast: ToastService,
  ) {
    effect(() => {
      this.busqueda();
      this.categoriaActiva();
      this.paginaActual.set(1);
    });
  }

  ngOnInit() {
    this.productosService.getAll().subscribe(productos => {
      this.resenasService.getResumen().subscribe(resumen => {
        const mapaResenas = new Map(resumen.map(r => [r.productoId, r]));
        this.productos.set(productos.map(p => ({
          ...p,
          calificacionPromedio: mapaResenas.get(p.id)?.promedio ?? 0,
          totalResenas: mapaResenas.get(p.id)?.total ?? 0,
        })));
      });
    });
  }

  agregarAlCarrito(producto: Producto, event: Event) {
    event.stopPropagation();
    if (!producto.activo) {
      this.toast.error('Este producto está agotado');
      return;
    }
    this.carritoService.agregar(producto);
    this.toast.exito('Agregado al carrito');
  }

  imagenUrl(imagen: string): string {
    return `${environment.uploadsUrl}/${imagen}`;
  }

  irADetalle(id: number) {
    this.router.navigate(['/productos', id]);
  }

  estrellas(promedio: number): string[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(promedio) ? '★' : '☆');
  }

  paginaAnterior() {
    if (this.paginaActual() > 1) this.paginaActual.update(p => p - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  paginaSiguiente() {
    if (this.paginaActual() < this.totalPaginas()) this.paginaActual.update(p => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
