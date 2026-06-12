import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductosService } from '../productos';
import { CarritoService } from '../../carrito/carrito.service';
import { AuthService } from '../../auth/auth';
import { Navbar } from '../../shared/navbar/navbar';
import { ToastService } from '../../shared/toast/toast.service';
import { Producto } from '../producto.interface';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-producto-detalle',
    imports: [CurrencyPipe, RouterModule, Navbar],
    templateUrl: './producto-detalle.html',
    styleUrl: './producto-detalle.css',
})
export class ProductoDetalle implements OnInit {
    producto = signal<Producto | null>(null);
    cantidad = signal(1);
    cargando = signal(true);
    descripcionExpandida = signal(false);
    imagenActiva = signal<string | null>(null);
    readonly LIMITE_DESCRIPCION = 300;

    get descripcionCorta(): string {
        const desc = this.producto()?.descripcion ?? '';
        return desc.length > this.LIMITE_DESCRIPCION
            ? desc.slice(0, this.LIMITE_DESCRIPCION) + '...'
            : desc;
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private productosService: ProductosService,
        private carritoService: CarritoService,
        private authService: AuthService,
        private toast: ToastService,
    ) {}

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.productosService.getById(id).subscribe({
            next: (p) => { this.producto.set(p); this.imagenActiva.set(p.imagen ?? null); this.cargando.set(false); },
            error: () => { this.cargando.set(false); this.router.navigate(['/productos']); },
        });
    }

    aumentarCantidad() {
        const p = this.producto();
        if (!p || this.cantidad() >= p.stock) return;
        this.cantidad.update(c => c + 1);
    }

    disminuirCantidad() {
        if (this.cantidad() <= 1) return;
        this.cantidad.update(c => c - 1);
    }

    agregarAlCarrito() {
        const p = this.producto();
        if (!p) return;
        if (!this.authService.getToken()) {
            this.router.navigate(['/login']);
            return;
        }
        if (p.stock === 0) {
            this.toast.error('Este producto está agotado');
            return;
        }
        this.carritoService.agregarItem(p.id, this.cantidad()).subscribe({
            next: () => this.toast.exito(`✿ ${this.cantidad()} unidad(es) agregada(s) al carrito`),
            error: (err) => this.toast.error(err.error?.message || 'No se pudo agregar al carrito'),
        });
    }

    pedirPorWhatsapp() {
        const p = this.producto();
        if (!p) return;
        const precio = (p.precio * this.cantidad()).toLocaleString('es-CO');
        const msg = `Hola! Deseo realizar este pedido\n\n*${p.nombre}*\nCantidad: ${this.cantidad()}\nPrecio: $${precio}\n\n¿Está disponible?`;
        window.open(`https://wa.me/573189605857?text=${encodeURIComponent(msg)}`, '_blank');
    }

    getImagenUrl(imagen: string): string {
        return `${environment.apiUrl}/uploads/${imagen}`;
    }
}
