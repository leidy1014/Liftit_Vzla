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
  columnas = ['nombre', 'descripcion', 'activo', 'acciones'];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoriasService: Categorias,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['']
    });
  }

  ngOnInit() {
    this.cargarCategorias();
  }


  cargarCategorias() {
    this.categoriasService.getAll().subscribe(data => this.categorias.set(data));
  }

  toggleFormulario() {
    this.mostrarFormulario.set(!this.mostrarFormulario());
  }

  guardar() {
    if (this.form.invalid) return;
    this.categoriasService.create(this.form.value).subscribe(() => {
      this.cargarCategorias();
      this.form.reset();
      this.mostrarFormulario.set(false);
    });
  }

  eliminar(id: number) {
    this.categoriasService.delete(id).subscribe(() => this.cargarCategorias());
  }
}