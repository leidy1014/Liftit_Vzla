import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Categoria } from '../../categorias/categoria.interface';
import { Categorias } from '../../categorias/categorias';

@Component({
  selector: 'app-admin-categorias',
  imports: [ReactiveFormsModule, MatTableModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule],
  templateUrl: './admin-categorias.html',
  styleUrl: './admin-categorias.css',
})
export class AdminCategorias {
  categorias = signal<Categoria[]>([]);
  mostrarFormulario = signal(false);
  editando = signal<Categoria | null>(null);
  columnas = ['nombre', 'descripcion', 'activo', 'acciones'];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoriasService: Categorias,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      activo: [true],
    });
  }

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriasService.getAll().subscribe(data => this.categorias.set(data));
  }

  toggleFormulario() {
    this.editando.set(null);
    this.form.reset({ nombre: '', descripcion: '', activo: true });
    this.mostrarFormulario.set(!this.mostrarFormulario());
  }

  editar(cat: Categoria) {
    this.editando.set(cat);
    this.form.patchValue({ nombre: cat.nombre, descripcion: cat.descripcion, activo: cat.activo });
    this.mostrarFormulario.set(true);
  }

  guardar() {
    if (this.form.invalid) return;
    const cat = this.editando();
    if (cat) {
      this.categoriasService.update(cat.id, this.form.value).subscribe(() => {
        this.cargarCategorias();
        this.cancelar();
      });
    } else {
      this.categoriasService.create(this.form.value).subscribe(() => {
        this.cargarCategorias();
        this.cancelar();
      });
    }
  }

  cancelar() {
    this.editando.set(null);
    this.form.reset({ nombre: '', descripcion: '', activo: true });
    this.mostrarFormulario.set(false);
  }

  eliminar(id: number) {
    this.categoriasService.delete(id).subscribe(() => this.cargarCategorias());
  }
}