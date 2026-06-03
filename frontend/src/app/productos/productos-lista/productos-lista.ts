import { Component, OnInit, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductosService } from '../productos';
import { Producto } from '../producto.interface';
import { CarritoService } from '../../carrito/carrito.service';
import { AuthService } from '../../auth/auth';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { ToastService } from '../../shared/toast/toast.service';
import { environment } from '../../../environments/environment';

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
        private authService: AuthService,
        private router: Router,
        private toast: ToastService,
    ) {}

    ngOnInit() {
        this.productosService.getAll().subscribe(data => this.productos.set(data));
    }

    agregarAlCarrito(producto: Producto, event: Event) {
        event.stopPropagation();
        if (!this.authService.getToken()) {
            this.router.navigate(['/login']);
            return;
        }
        if (producto.stock === 0) {
            this.toast.error('Este producto está agotado');
            return;
        }
        this.carritoService.agregarItem(producto.id, 1).subscribe({
            next: () => this.toast.exito('✿ Agregado al carrito'),
            error: (err) => this.toast.error(err.error?.message || 'No se pudo agregar al carrito'),
        });
    }

    imagenUrl(imagen: string): string {
        return `${environment.apiUrl}/uploads/${imagen}`;
    }

    irADetalle(id: number) {
        this.router.navigate(['/productos', id]);
    }
}
