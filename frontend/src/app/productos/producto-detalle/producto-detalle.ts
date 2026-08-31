import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, Location } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductosService } from '../productos';
import { CarritoService } from '../../carrito/carrito.service';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { ToastService } from '../../shared/toast/toast.service';
import { Producto } from '../producto.interface';
import { Resena } from '../../resenas/resena.interface';
import { ResenasService } from '../../resenas/resenas.service';
import { AuthService } from '../../auth/auth';
import { Categorias } from '../../categorias/categorias';
import { Categoria } from '../../categorias/categoria.interface';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-producto-detalle',
    imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterModule, FormsModule, ReactiveFormsModule, Navbar, Footer],
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

    relacionados = signal<Producto[]>([]);
    resenas = signal<Resena[]>([]);
    nuevaPuntuacion = signal(0);
    nuevoComentario = signal('');
    enviandoResena = signal(false);
    yaReseno = signal(false);
    estrellasHover = signal(0);

    mostrarModalEditar = signal(false);
    categoriasModal = signal<Categoria[]>([]);
    imagenModalFile = signal<File | null>(null);
    imagenModalPreview = signal<string | null>(null);
    guardandoEdicion = signal(false);
    editForm!: FormGroup;

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
        public router: Router,
        private productosService: ProductosService,
        private carritoService: CarritoService,
        private resenasService: ResenasService,
        public authService: AuthService,
        private toast: ToastService,
        private titleService: Title,
        private metaService: Meta,
        private fb: FormBuilder,
        private categoriasService: Categorias,
        private location: Location,
    ) {
        this.editForm = this.fb.group({
            nombre: ['', Validators.required],
            descripcion: [''],
            precioDolar: [0, [Validators.required, Validators.min(0)]],
            precioBolivares: [null],
            activo: [true],
            categoriaIds: [[]],
        });
    }

    volver() {
        this.location.back();
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const slug = params.get('slug')!;
            window.scrollTo({ top: 0, behavior: 'instant' });
            this.cargando.set(true);
            this.producto.set(null);
            this.relacionados.set([]);
            this.resenas.set([]);
            this.cantidad.set(1);
            this.descripcionExpandida.set(false);
            this.yaReseno.set(false);

            this.productosService.getBySlug(slug).subscribe({
                next: (p) => {
                    this.producto.set(p);
                    this.imagenActiva.set(p.imagen ?? null);
                    this.cargando.set(false);

                    this.resenasService.getByProducto(p.id).subscribe(resenas => this.resenas.set(resenas));

                    this.productosService.getAll().subscribe(todos => {
                        const rel = todos
                            .filter(x => x.id !== p.id && x.activo &&
                                x.categorias?.some(xc => p.categorias?.some(pc => pc.id === xc.id))
                            )
                            .slice(0, 4);
                        this.relacionados.set(rel);
                    });

                    const desc = p.descripcion
                        ? p.descripcion.slice(0, 155).trimEnd() + '...'
                        : `${p.nombre} — Equipamiento deportivo profesional. Cómpralo en Liftit Fitness Venezuela.`;
                    const imagen = p.imagen
                        ? `${environment.uploadsUrl}/${p.imagen}`
                        : 'https://liftitfitnesscol.com/hero-banner.jpg.png';
                    const urlSlug = p.slug ?? p.id;

                    this.titleService.setTitle(`${p.nombre} | Liftit Fitness`);
                    this.metaService.updateTag({ name: 'description', content: desc });
                    this.metaService.updateTag({ property: 'og:title', content: `${p.nombre} | Liftit Fitness` });
                    this.metaService.updateTag({ property: 'og:description', content: desc });
                    this.metaService.updateTag({ property: 'og:image', content: imagen });
                    this.metaService.updateTag({ property: 'og:url', content: `https://liftitfitnesscol.com/productos/${urlSlug}` });
                },
                error: () => { this.cargando.set(false); this.router.navigate(['/productos']); },
            });
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
        const precioUsd = (p.precioDolar * this.cantidad()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const bs = p.precioBolivares ? `\nBs. ${(p.precioBolivares * this.cantidad()).toLocaleString('es-VE')}` : '';
        const msg = `Hola! Deseo realizar este pedido\n\n*${p.nombre}*\nCantidad: ${this.cantidad()}\nPrecio: $${precioUsd} USD${bs}\n\n¿Está disponible?`;
        window.open(`https://wa.me/584128349722?text=${encodeURIComponent(msg)}`, '_blank');
    }

    compartirPorWhatsapp() {
        const p = this.producto();
        if (!p) return;
        const url = `https://liftitfitnesscol.com/productos/${p.slug ?? p.id}`;
        const precioUsd = p.precioDolar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const bs = p.precioBolivares ? `\n🏷️ Bs. ${p.precioBolivares.toLocaleString('es-VE')}` : '';
        const msg = `¡Hola! Te comparto este producto de *Liftit Fitness Venezuela* 💪\n\n*${p.nombre}*${bs}\n💰 Precio: $${precioUsd} USD\n\nToca el enlace para ver la descripción completa y realizar tu pedido:\n👉 ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }

    abrirModalEditar() {
        const p = this.producto();
        if (!p) return;
        this.editForm.patchValue({
            nombre: p.nombre,
            descripcion: p.descripcion ?? '',
            precioDolar: p.precioDolar,
            precioBolivares: p.precioBolivares ?? null,
            activo: p.activo,
            categoriaIds: p.categorias?.map(c => c.id) ?? [],
        });
        this.imagenModalFile.set(null);
        this.imagenModalPreview.set(p.imagen ? `${environment.uploadsUrl}/${p.imagen}` : null);
        if (!this.categoriasModal().length) {
            this.categoriasService.getAll().subscribe(cats => this.categoriasModal.set(cats));
        }
        this.mostrarModalEditar.set(true);
    }

    cerrarModalEditar() {
        this.mostrarModalEditar.set(false);
    }

    toggleCategoriaModal(id: number, checked: boolean) {
        const control = this.editForm.get('categoriaIds')!;
        const actuales: number[] = control.value ?? [];
        control.setValue(
            checked ? [...actuales, id] : actuales.filter(v => v !== id)
        );
    }

    onImagenModalSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        this.imagenModalFile.set(file);
        const reader = new FileReader();
        reader.onload = () => this.imagenModalPreview.set(reader.result as string);
        reader.readAsDataURL(file);
    }

    guardarEdicion() {
        if (this.editForm.invalid) return;
        this.guardandoEdicion.set(true);
        const file = this.imagenModalFile();
        if (file) {
            this.productosService.uploadImagen(file).subscribe({
                next: ({ filename }) => this.guardarEdicionConImagen(filename),
                error: () => {
                    this.toast.error('Error al subir la imagen');
                    this.guardandoEdicion.set(false);
                },
            });
        } else {
            this.guardarEdicionConImagen(null);
        }
    }

    private guardarEdicionConImagen(imagen: string | null) {
        const p = this.producto();
        if (!p) return;
        const datos: any = { ...this.editForm.value };
        if (imagen) datos.imagen = imagen;
        this.productosService.update(p.id, datos).subscribe({
            next: (actualizado) => {
                this.producto.set(actualizado);
                this.toast.exito('Producto actualizado');
                this.cerrarModalEditar();
                this.guardandoEdicion.set(false);
            },
            error: () => {
                this.toast.error('Error al actualizar el producto');
                this.guardandoEdicion.set(false);
            },
        });
    }

    getImagenUrl(imagen: string): string {
        return `${environment.uploadsUrl}/${imagen}`;
    }
}
