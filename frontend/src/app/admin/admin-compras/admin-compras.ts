import { Component, OnInit, signal, computed, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { ComprasService } from './compras.service';
import { ProductosService } from '../../productos/productos';
import { Producto } from '../../productos/producto.interface';
import { Compra, Proveedor, ProveedorHistorial } from './compra.interface';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmService } from '../../shared/confirm/confirm.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-admin-compras',
    imports: [
        ReactiveFormsModule,
        MatTableModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        DatePipe,
        CurrencyPipe,
    ],
    templateUrl: './admin-compras.html',
    styleUrl: './admin-compras.css',
})
export class AdminCompras implements OnInit {
    vista = signal<'lista' | 'nueva' | 'detalle' | 'proveedores' | 'historial-proveedor'>('lista');
    compras = signal<Compra[]>([]);
    compraSeleccionada = signal<Compra | null>(null);
    proveedorHistorial = signal<ProveedorHistorial | null>(null);
    proveedores = signal<Proveedor[]>([]);
    productos = signal<Producto[]>([]);
    filtro = signal<'todos' | 'pedido' | 'recibido' | 'cancelado'>('todos');
    editandoId = signal<number | null>(null);
    editandoProveedor = signal<Proveedor | null>(null);
    private textoProveedorEscrito = '';

    @ViewChildren('productoInput') productoInputs!: QueryList<ElementRef>;

    comprasFiltradas = computed(() => {
        const estado = this.filtro();
        const todas = this.compras();
        if (estado === 'todos') return todas;
        return todas.filter(c => c.estado === estado);
    });

    columnasLista = ['numero', 'fecha', 'proveedor', 'total', 'estado', 'acciones'];

    compraForm: FormGroup;
    proveedorForm: FormGroup;

    constructor(
        private comprasService: ComprasService,
        private productosService: ProductosService,
        private fb: FormBuilder,
        private toast: ToastService,
        private confirm: ConfirmService,
    ) {
        this.compraForm = this.fb.group({
            proveedorId: [null, Validators.required],
            proveedorNombre: [''],
            facturaProveedor: [''],
            fechaVencimiento: [''],
            lineas: this.fb.array([]),
        });

        this.proveedorForm = this.fb.group({
            nombre: ['', Validators.required],
            nit: [''],
            telefono: [''],
            email: [''],
        });
    }

    ngOnInit() {
        this.cargarCompras();
        this.comprasService.getProveedores().subscribe(data => this.proveedores.set(data));
        this.productosService.getAll().subscribe(data => this.productos.set(data));
    }

    cargarCompras() {
        this.comprasService.getAll().subscribe(data => this.compras.set(data));
    }

    // ── FormArray de líneas ──
    get lineasArray(): FormArray {
        return this.compraForm.get('lineas') as FormArray;
    }

    asFormGroup(control: AbstractControl): FormGroup {
        return control as FormGroup;
    }

    private crearLineaGroup(productoId: number | null = null, productoNombre = '', cantidad = 1, precioCompra = 0): FormGroup {
        return this.fb.group({
            productoId: [productoId, Validators.required],
            productoNombre: [productoNombre],
            cantidad: [cantidad, [Validators.required, Validators.min(1)]],
            precioCompra: [precioCompra, [Validators.required, Validators.min(0.01)]],
        });
    }

    agregarLinea() {
        this.lineasArray.push(this.crearLineaGroup());
        setTimeout(() => {
            const inputs = this.productoInputs.toArray();
            if (inputs.length > 0) {
                inputs[inputs.length - 1].nativeElement.focus();
            }
        }, 0);
    }

    eliminarLinea(i: number) {
        this.lineasArray.removeAt(i);
    }

    // ── Autocomplete de productos ──
    getProductosFiltrados(index: number): Producto[] {
        const linea = this.lineasArray.at(index) as FormGroup;
        const texto = (linea.get('productoNombre')?.value ?? '').toLowerCase();
        if (!texto) return this.productos();
        return this.productos().filter(p =>
            p.nombre.toLowerCase().includes(texto) ||
            (p.referencia && p.referencia.toLowerCase().includes(texto))
        );
    }

    onProductoSeleccionado(index: number, event: MatAutocompleteSelectedEvent) {
        const nombre: string = event.option.value;
        const producto = this.productos().find(p => p.nombre === nombre);
        if (producto) {
            const linea = this.lineasArray.at(index) as FormGroup;
            linea.get('productoId')?.setValue(producto.id);
            linea.get('precioCompra')?.setValue(producto.costo);
        }
    }

    onNombreProductoChange(index: number) {
        const linea = this.lineasArray.at(index) as FormGroup;
        const texto = linea.get('productoNombre')?.value ?? '';
        if (!this.productos().find(p => p.nombre === texto)) {
            linea.get('productoId')?.setValue(null);
        }
    }

    // ── Autocomplete de proveedor ──
    getProveedoresFiltrados(): Proveedor[] {
        const texto = (this.compraForm.get('proveedorNombre')?.value ?? '').toLowerCase();
        if (!texto) return this.proveedores();
        return this.proveedores().filter(p => p.nombre.toLowerCase().includes(texto));
    }

    onProveedorSeleccionado(event: MatAutocompleteSelectedEvent) {
        if (event.option.value === '__crear__') {
            const nombre = this.textoProveedorEscrito.trim(); // usamos el texto guardado ANTES de la selección
            if (!nombre) return;
            this.comprasService.crearProveedor({ nombre }).subscribe({
                next: (prov) => {
                    this.proveedores.update(list => [...list, prov]);
                    this.compraForm.get('proveedorId')?.setValue(prov.id);
                    this.compraForm.get('proveedorNombre')?.setValue(prov.nombre);
                    this.toast.exito(`Proveedor "${prov.nombre}" creado`);
                },
                error: (err) => this.toast.error(err.error?.message || 'No se pudo crear el proveedor'),
            });
            return;
        }
        const prov = this.proveedores().find(p => p.nombre === event.option.value);
        if (prov) this.compraForm.get('proveedorId')?.setValue(prov.id);
    }

    onNombreProveedorChange() {
        const texto = this.compraForm.get('proveedorNombre')?.value ?? '';
        this.textoProveedorEscrito = texto; // guardamos ANTES de que Angular lo sobreescriba
        if (!this.proveedores().find(p => p.nombre === texto)) {
            this.compraForm.get('proveedorId')?.setValue(null);
        }
    }

    mostrarCrearProveedor(): boolean {
        const texto = (this.compraForm.get('proveedorNombre')?.value ?? '').trim();
        if (!texto) return false;
        return !this.proveedores().find(p => p.nombre.toLowerCase() === texto.toLowerCase());
    }

    // ── Cálculos ──
    calcularSubtotal(index: number): number {
        const linea = this.lineasArray.at(index).value;
        return (linea.cantidad || 0) * (linea.precioCompra || 0);
    }

    calcularTotal(): number {
        let total = 0;
        for (let i = 0; i < this.lineasArray.length; i++) {
            total += this.calcularSubtotal(i);
        }
        return total;
    }

    // ── Navegación ──
    irANueva() {
        this.editandoId.set(null);
        this.compraForm.reset();
        while (this.lineasArray.length > 0) this.lineasArray.removeAt(0);
        this.agregarLinea();
        this.vista.set('nueva');
    }

    irAEditar(compra: Compra) {
        this.editandoId.set(compra.id);
        this.compraForm.reset({
            proveedorId: compra.proveedor?.id ?? null,
            proveedorNombre: compra.proveedor?.nombre ?? '',
            facturaProveedor: compra.facturaProveedor ?? '',
            fechaVencimiento: compra.fechaVencimiento ?? '',
        });
        while (this.lineasArray.length > 0) this.lineasArray.removeAt(0);
        for (const item of compra.items ?? []) {
            this.lineasArray.push(this.crearLineaGroup(
                item.producto?.id ?? null,
                item.producto?.nombre ?? '',
                item.cantidad,
                item.precioCompra,
            ));
        }
        this.vista.set('nueva');
    }

    private vistaAnterior: 'lista' | 'nueva' | 'detalle' | 'proveedores' | 'historial-proveedor' = 'lista';

    volver() {
        this.compraSeleccionada.set(null);
        this.editandoId.set(null);
        this.vista.set(this.vistaAnterior);
        this.vistaAnterior = 'lista';
    }

    // ── CRUD compras ──
    guardarCompra() {
        if (this.compraForm.invalid || this.lineasArray.length === 0) return;
        const { proveedorId, facturaProveedor, fechaVencimiento, lineas } = this.compraForm.value;

        const dto = {
            proveedorId,
            facturaProveedor: facturaProveedor || undefined,
            fechaVencimiento: fechaVencimiento || undefined,
            items: lineas.map((l: any) => ({
                productoId: l.productoId,
                cantidad: l.cantidad,
                precioCompra: l.precioCompra,
            })),
        };

        const id = this.editandoId();
        if (id) {
            this.comprasService.actualizar(id, dto).subscribe({
                next: (actualizada) => {
                    this.toast.exito('Pedido actualizado correctamente');
                    this.cargarCompras();
                    this.compraSeleccionada.set(actualizada);
                    this.vista.set('detalle');
                },
                error: (err) => this.toast.error(err.error?.message || 'Error al actualizar'),
            });
        } else {
            this.comprasService.crear(dto).subscribe({
                next: () => {
                    this.toast.exito('Pedido creado correctamente');
                    this.cargarCompras();
                    this.vista.set('lista');
                },
                error: (err) => this.toast.error(err.error?.message || 'Error al crear el pedido'),
            });
        }
    }

    verDetalle(compra: Compra) {
        this.vistaAnterior = this.vista() === 'historial-proveedor' ? 'historial-proveedor' : 'lista';
        this.comprasService.getById(compra.id).subscribe(data => {
            this.compraSeleccionada.set(data);
            this.vista.set('detalle');
        });
    }

    recibir() {
        const compra = this.compraSeleccionada()!;
        this.comprasService.recibir(compra.id).subscribe({
            next: (actualizada) => {
                this.toast.exito(`${actualizada.numero} recibida — stock actualizado`);
                this.compraSeleccionada.set(actualizada);
                this.cargarCompras();
            },
            error: (err) => this.toast.error(err.error?.message || 'Error al recibir'),
        });
    }

    cancelar() {
        const compra = this.compraSeleccionada()!;
        this.comprasService.cancelar(compra.id).subscribe({
            next: (actualizada) => {
                this.toast.exito('Pedido cancelado');
                this.compraSeleccionada.set(actualizada);
                this.cargarCompras();
            },
            error: (err) => this.toast.error(err.error?.message || 'Error al cancelar'),
        });
    }

    // ── CRUD proveedores ──
    abrirNuevoProveedor() {
        this.editandoProveedor.set(null);
        this.proveedorForm.reset();
    }

    editarProveedor(proveedor: Proveedor) {
        this.editandoProveedor.set(proveedor);
        this.proveedorForm.setValue({
            nombre: proveedor.nombre,
            nit: proveedor.nit ?? '',
            telefono: proveedor.telefono ?? '',
            email: proveedor.email ?? '',
        });
    }

    guardarProveedor() {
        if (this.proveedorForm.invalid) return;
        const data = this.proveedorForm.value;
        const editando = this.editandoProveedor();

        const obs = editando
            ? this.comprasService.actualizarProveedor(editando.id, data)
            : this.comprasService.crearProveedor(data);

        obs.subscribe({
            next: () => {
                this.toast.exito(editando ? 'Proveedor actualizado' : 'Proveedor creado');
                this.comprasService.getProveedores().subscribe(data => this.proveedores.set(data));
                this.editandoProveedor.set(null);
                this.proveedorForm.reset();
            },
            error: (err) => this.toast.error(err.error?.message || 'Error al guardar proveedor'),
        });
    }

    eliminarProveedor(id: number) {
        this.confirm.confirm({
            titulo: 'Desactivar proveedor',
            mensaje: 'El proveedor no aparecerá en las búsquedas.',
            textoConfirmar: 'Desactivar',
            tipo: 'peligro',
        }, () => {
            this.comprasService.eliminarProveedor(id).subscribe({
                next: () => {
                    this.toast.exito('Proveedor desactivado');
                    this.comprasService.getProveedores().subscribe(data => this.proveedores.set(data));
                },
                error: (err) => this.toast.error(err.error?.message || 'Error'),
            });
        });
    }

    verHistorial(proveedor: Proveedor) {
        this.comprasService.getHistorialProveedor(proveedor.id).subscribe({
            next: (data) => {
                this.proveedorHistorial.set(data);
                this.vista.set('historial-proveedor');
            },
            error: (err) => this.toast.error(err.error?.message || 'Error al cargar historial'),
        });
    }

    volverAProveedores() {
        this.proveedorHistorial.set(null);
        this.vista.set('proveedores');
    }

    borrarProveedor(id: number) {
        this.confirm.confirm({
            titulo: 'Eliminar proveedor',
            mensaje: 'Esta acción no se puede deshacer.',
            textoConfirmar: 'Eliminar',
            tipo: 'peligro',
        }, () => {
            this.comprasService.borrarProveedorPermanente(id).subscribe({
                next: () => {
                    this.toast.exito('Proveedor eliminado');
                    this.comprasService.getProveedores().subscribe(data => this.proveedores.set(data));
                },
                error: (err) => this.toast.error(err.error?.message || 'Error al eliminar'),
            });
        });
    }

    getImagenUrl(imagen: string): string {
        return `${environment.apiUrl}/uploads/${imagen}`;
    }
}
