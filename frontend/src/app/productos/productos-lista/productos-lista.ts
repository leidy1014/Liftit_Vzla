import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { ProductosService } from '../productos';
import { Producto } from '../producto.interface';
import { CarritoService } from '../../carrito/carrito.service';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { ToastService } from '../../shared/toast/toast.service';
import { ResenasService } from '../../resenas/resenas.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-productos-lista',
  imports: [CurrencyPipe, DecimalPipe, RouterModule, Navbar, Footer],
  templateUrl: './productos-lista.html',
  styleUrl: './productos-lista.css',
})
export class ProductosLista implements OnInit {
  productos = signal<Producto[]>([]);
  categoriaActiva = signal<string | null>(null);
  busqueda = signal('');
  paginaActual = signal(1);
  readonly productosPorPagina = 12;

  // Categorías únicas con imagen del primer producto de cada una
  categorias = computed(() => {
    const mapa = new Map<number, { id: number; nombre: string; imagen: string | null }>();
    for (const p of this.productos()) {
      if (!p.categoria) continue;
      if (!mapa.has(p.categoria.id)) {
        mapa.set(p.categoria.id, {
          id: p.categoria.id,
          nombre: p.categoria.nombre,
          imagen: p.imagen ?? null,
        });
      }
    }
    return [...mapa.values()];
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
    private titleService: Title,
    private metaService: Meta,
  ) {
    effect(() => {
      this.busqueda();
      this.categoriaActiva();
      this.paginaActual.set(1);
    });
  }

  ngOnInit() {
    this.titleService.setTitle('Catálogo | Liftit Fitness — Equipamiento Deportivo Colombia');
    this.metaService.updateTag({ name: 'description', content: 'Explora nuestro catálogo de equipamiento deportivo profesional: pesas rusas, barras, accesorios de gimnasio y más. Envíos a todo Colombia.' });
    this.metaService.updateTag({ property: 'og:title', content: 'Catálogo | Liftit Fitness — Equipamiento Deportivo' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://liftitfitnesscol.com/productos' });

    forkJoin([
      this.productosService.getAll(),
      this.resenasService.getResumen(),
    ]).subscribe(([productos, resumen]) => {
      const mapaResenas = new Map(resumen.map(r => [r.productoId, r]));
      this.productos.set(productos.map(p => ({
        ...p,
        calificacionPromedio: mapaResenas.get(p.id)?.promedio ?? 0,
        totalResenas: mapaResenas.get(p.id)?.total ?? 0,
      })));
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

  private scrollACatalogo() {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  }

  paginaAnterior() {
    if (this.paginaActual() > 1) this.paginaActual.update(p => p - 1);
    this.scrollACatalogo();
  }

  paginaSiguiente() {
    if (this.paginaActual() < this.totalPaginas()) this.paginaActual.update(p => p + 1);
    this.scrollACatalogo();
  }
}
