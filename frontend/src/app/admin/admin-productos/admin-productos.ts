import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ProductosService } from '../../productos/productos';
import { Categorias } from '../../categorias/categorias';
import { Producto } from '../../productos/producto.interface';
import { Categoria } from '../../categorias/categoria.interface';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmService } from '../../shared/confirm/confirm.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-productos',
  imports: [ReactiveFormsModule, MatTableModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, CdkTextareaAutosize],
  templateUrl: './admin-productos.html',
  styleUrl: './admin-productos.css',
})
export class AdminProductos implements OnInit {
  productos = signal<Producto[]>([]);
  productoEditando = signal<Producto | null>(null);
  categorias = signal<Categoria[]>([]);
  mostrarFormulario = signal(false);
  columnas = ['imagen', 'nombre', 'precio', 'margen', 'stock', 'categoria', 'acciones'];

  imagenFile = signal<File | null>(null);
  imagenPreview = signal<string | null>(null);

  form: FormGroup;

  constructor(
    private productosService: ProductosService,
    private categoriasService: Categorias,
    private fb: FormBuilder,
    private toast: ToastService,
    private confirm: ConfirmService,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      costo: [0, Validators.min(0)],
      stock: [0, Validators.min(0)],
      stockMinimo: [5, Validators.min(0)],
      referencia: [''],
      marca: [''],
      codigoBarras: [''],
      categoriaId: [null],
    });
  }

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos() {
    this.productosService.getAll().subscribe(data => this.productos.set(data));
  }

  cargarCategorias() {
    this.categoriasService.getAll().subscribe(data => this.categorias.set(data));
  }

  toggleFormulario() {
    const abriendo = !this.mostrarFormulario();
    this.mostrarFormulario.set(abriendo);
    if (!abriendo) {
      this.productoEditando.set(null);
      this.imagenFile.set(null);
      this.imagenPreview.set(null);
      this.form.reset({ precio: 0, stock: 0 });
    }
  }

  editar(producto: Producto) {
    this.productoEditando.set(producto);
    this.form.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      costo: producto.costo ?? 0,
      stock: producto.stock,
      stockMinimo: producto.stockMinimo ?? 5,
      referencia: producto.referencia ?? '',
      marca: producto.marca ?? '',
      codigoBarras: producto.codigoBarras ?? '',
      categoriaId: producto.categoria?.id ?? null,
    });
    this.imagenFile.set(null);
    this.imagenPreview.set(producto.imagen ? `${environment.apiUrl}/uploads/${producto.imagen}` : null);
    this.mostrarFormulario.set(true);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imagenFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.imagenPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  guardar() {
    if (this.form.invalid) return;
    const file = this.imagenFile();
    if (file) {
      this.productosService.uploadImagen(file).subscribe({
        next: ({ filename }) => this.guardarConImagen(filename),
        error: () => this.toast.error('Error al subir la imagen'),
      });
    } else {
      this.guardarConImagen(null);
    }
  }

  private guardarConImagen(imagen: string | null) {
    const datos: any = { ...this.form.value };
    if (imagen) datos.imagen = imagen;

    const editando = this.productoEditando();
    if (editando) {
      this.productosService.update(editando.id, datos).subscribe(() => {
        this.toast.exito('Producto actualizado');
        this.cargarProductos();
        this.resetFormulario();
      });
    } else {
      this.productosService.create(datos).subscribe(() => {
        this.toast.exito('Producto creado');
        this.cargarProductos();
        this.resetFormulario();
      });
    }
  }

  private resetFormulario() {
    this.form.reset({ precio: 0, costo: 0, stock: 0, stockMinimo: 5 });
    this.productoEditando.set(null);
    this.imagenFile.set(null);
    this.imagenPreview.set(null);
    this.mostrarFormulario.set(false);
  }

  eliminar(id: number) {
    this.confirm.confirm({
      titulo: 'Eliminar producto',
      mensaje: 'Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este producto?',
      textoConfirmar: 'Eliminar',
      tipo: 'peligro',
    }, () => {
      this.productosService.delete(id).subscribe({
        next: () => {
          this.toast.exito('Producto eliminado');
          this.cargarProductos();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'No se pudo eliminar. Puede que el producto esté en uso en ventas o compras.');
        },
      });
    });
  }

  getImagenUrl(imagen: string): string {
    return `${environment.apiUrl}/uploads/${imagen}`;
  }

  getMargen(producto: Producto): number {
    if (!producto.costo || producto.costo === 0) return 0;
    return Math.round(((producto.precio - producto.costo) / producto.precio) * 100);
  }

  onImagenExtraSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const editando = this.productoEditando();
    if (!file || !editando) return;
    this.productosService.agregarImagen(editando.id, file).subscribe({
      next: (p) => {
        this.productoEditando.set(p);
        this.toast.exito('Imagen agregada');
        this.cargarProductos();
      },
      error: () => this.toast.error('Error al subir la imagen'),
    });
    input.value = '';
  }

  eliminarImagenExtra(filename: string) {
    const editando = this.productoEditando();
    if (!editando) return;
    this.productosService.eliminarImagen(editando.id, filename).subscribe({
      next: (p) => {
        this.productoEditando.set(p);
        this.toast.exito('Imagen eliminada');
        this.cargarProductos();
      },
      error: () => this.toast.error('Error al eliminar la imagen'),
    });
  }
}
