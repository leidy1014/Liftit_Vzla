import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../productos';
import { CarritoService } from '../../carrito/carrito.service';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { ToastService } from '../../shared/toast/toast.service';
import { Producto } from '../producto.interface';
import { Resena } from '../../resenas/resena.interface';
import { ResenasService } from '../../resenas/resenas.service';
import { AuthService } from '../../auth/auth';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-producto-detalle',
    imports: [CurrencyPipe, DatePipe, RouterModule, FormsModule, Navbar, Footer],
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

    resenas = signal<Resena[]>([]);
    nuevaPuntuacion = signal(0);
    nuevoComentario = signal('');
    enviandoResena = signal(false);
    yaReseno = signal(false);
    estrellasHover = signal(0);

    get descripcionCorta(): string {
        const desc = this.producto()?.descripcion ?? '';
        return desc.length > this.LIMITE_DESCRIPCION
            ? desc.slice(0, this.LIMITE_DESCRIPCION) + '...'
            : desc;
    }

    get promedioResenas(): number {
        const lista = this.resenas();
        if (!lista.length) return 0;
        return Math.round((lista.reduce((s, r) => s + r.puntuacion, 0) / lista.length) * 10) / 10;
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private productosService: ProductosService,
        private carritoService: CarritoService,
        private resenasService: ResenasService,
        public authService: AuthService,
        private toast: ToastService,
        private titleService: Title,
        private metaService: Meta,
    ) {}

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        forkJoin([
            this.productosService.getById(id),
            this.resenasService.getByProducto(id),
        ]).subscribe({
            next: ([p, resenas]) => {
                this.producto.set(p);
                this.imagenActiva.set(p.imagen ?? null);
                this.resenas.set(resenas);
                this.cargando.set(false);

                const desc = p.descripcion
                    ? p.descripcion.slice(0, 155).trimEnd() + '...'
                    : `${p.nombre} — Equipamiento deportivo profesional. Cómpralo en Liftit Fitness Colombia.`;
                const imagen = p.imagen
                    ? `${environment.uploadsUrl}/${p.imagen}`
                    : 'https://liftitfitnesscol.com/hero-banner.jpg.png';

                this.titleService.setTitle(`${p.nombre} | Liftit Fitness`);
                this.metaService.updateTag({ name: 'description', content: desc });
                this.metaService.updateTag({ property: 'og:title', content: `${p.nombre} | Liftit Fitness` });
                this.metaService.updateTag({ property: 'og:description', content: desc });
                this.metaService.updateTag({ property: 'og:image', content: imagen });
                this.metaService.updateTag({ property: 'og:url', content: `https://liftitfitnesscol.com/productos/${p.id}` });
            },
            error: () => { this.cargando.set(false); this.router.navigate(['/productos']); },
        });
    }

    cargarResenas(productoId: number) {
        this.resenasService.getByProducto(productoId).subscribe(lista => {
            this.resenas.set(lista);
        });
    }

    estrellas(promedio: number): string[] {
        return Array.from({ length: 5 }, (_, i) => i < Math.round(promedio) ? '★' : '☆');
    }

    estrellasSelector(n: number): string {
        const hover = this.estrellasHover();
        const sel = this.nuevaPuntuacion();
        const activo = hover > 0 ? hover : sel;
        return n <= activo ? '★' : '☆';
    }

    enviarResena() {
        const p = this.producto();
        if (!p || this.nuevaPuntuacion() === 0) {
            this.toast.error('Selecciona una puntuación de 1 a 5 estrellas');
            return;
        }
        this.enviandoResena.set(true);
        this.resenasService.crear({
            productoId: p.id,
            puntuacion: this.nuevaPuntuacion(),
            comentario: this.nuevoComentario() || undefined,
        }).subscribe({
            next: () => {
                this.toast.exito('¡Gracias por tu reseña!');
                this.yaReseno.set(true);
                this.nuevaPuntuacion.set(0);
                this.nuevoComentario.set('');
                this.cargarResenas(p.id);
            },
            error: (err) => {
                this.toast.error(err.error?.message || 'No se pudo enviar la reseña');
            },
        }).add(() => this.enviandoResena.set(false));
    }

    aumentarCantidad() {
        if (this.cantidad() >= 99) return;
        this.cantidad.update(c => c + 1);
    }

    disminuirCantidad() {
        if (this.cantidad() <= 1) return;
        this.cantidad.update(c => c - 1);
    }

    agregarAlCarrito() {
        const p = this.producto();
        if (!p || !p.activo) return;
        this.carritoService.agregar(p, this.cantidad());
        this.toast.exito(`${this.cantidad()} unidad(es) agregada(s) al carrito`);
    }

    pedirPorWhatsapp() {
        const p = this.producto();
        if (!p) return;
        const precio = (p.precio * this.cantidad()).toLocaleString('es-CO');
        const msg = `Hola! Deseo realizar este pedido\n\n*${p.nombre}*\nCantidad: ${this.cantidad()}\nPrecio: $${precio}\n\n¿Está disponible?`;
        window.open(`https://wa.me/573213324759?text=${encodeURIComponent(msg)}`, '_blank');
    }

    compartirPorWhatsapp() {
        const p = this.producto();
        if (!p) return;
        const url = `https://liftitfitnesscol.com/productos/${p.id}`;
        const precio = p.precio.toLocaleString('es-CO');
        const descuento = p.precioAnterior
            ? `\n🏷️ Antes: $${p.precioAnterior.toLocaleString('es-CO')} COP`
            : '';
        const msg = `¡Hola! Te comparto este producto de *Liftit Fitness* 💪\n\n*${p.nombre}*${descuento}\n💰 Precio: $${precio} COP\n\nToca el enlace para ver la descripción completa y realizar tu pedido:\n👉 ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }

    getImagenUrl(imagen: string): string {
        return `${environment.uploadsUrl}/${imagen}`;
    }
}
