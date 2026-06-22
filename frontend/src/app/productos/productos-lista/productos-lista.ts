import { Component, OnInit, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductosService } from '../productos';
import { Producto } from '../producto.interface';
import { CarritoService } from '../../carrito/carrito.service';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { ToastService } from '../../shared/toast/toast.service';
import { environment } from '../../../environments/environment';

interface CategoriaConfig {
  nombre: string;
  icono: string;
}

const CATEGORIAS_ICONOS: CategoriaConfig[] = [
  { nombre: 'Tapetes',                    icono: '🧘' },
  { nombre: 'Kits de hierro',             icono: '🏋️' },
  { nombre: 'Maquinas multifuerzas',      icono: '⚙️' },
  { nombre: 'Mancuernas encauchadas',     icono: '💪' },
  { nombre: 'Bancos de entrenamiento',    icono: '🪑' },
  { nombre: 'Proteinas',                  icono: '🥤' },
  { nombre: 'Barras y discos olimpicos',  icono: '🏅' },
  { nombre: 'Accesorios',                 icono: '🎽' },
  { nombre: 'Linea Sportfitness',         icono: '⭐' },
];

@Component({
  selector: 'app-productos-lista',
  imports: [CurrencyPipe, RouterModule, Navbar],
  templateUrl: './productos-lista.html',
  styleUrl: './productos-lista.css',
})
export class ProductosLista implements OnInit {
  productos = signal<Producto[]>([]);
  categoriaActiva = signal<string | null>(null);
  busqueda = signal('');

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

  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.productosService.getAll().subscribe(data => this.productos.set(data));
  }

  getIcono(nombreCategoria: string): string {
    const normalizar = (s: string) => s.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
    const config = CATEGORIAS_ICONOS.find(c =>
      normalizar(c.nombre) === normalizar(nombreCategoria)
    );
    return config?.icono ?? '🏷️';
  }

  agregarAlCarrito(producto: Producto, event: Event) {
    event.stopPropagation();
    if (producto.stock === 0) {
      this.toast.error('Este producto está agotado');
      return;
    }
    this.carritoService.agregar(producto);
    this.toast.exito('Agregado al carrito');
  }

  imagenUrl(imagen: string): string {
    return `${environment.apiUrl}/uploads/${imagen}`;
  }

  irADetalle(id: number) {
    this.router.navigate(['/productos', id]);
  }
}
