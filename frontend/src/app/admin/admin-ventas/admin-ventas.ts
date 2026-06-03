import { Component, OnInit, signal, computed, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { VentasService } from './ventas.service';
import { ClientesService } from './clientes.service';
import { PdfVentasService } from './pdf-ventas.service';
import { PagosService } from '../admin-caja/pagos.service';
import { ProductosService } from '../../productos/productos';
import { Producto } from '../../productos/producto.interface';
import { Venta, ClienteVenta } from './venta.interface';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmService } from '../../shared/confirm/confirm.service';

@Component({
    selector: 'app-admin-ventas',
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
    templateUrl: './admin-ventas.html',
    styleUrl: './admin-ventas.css',
})
export class AdminVentas implements OnInit {
    vista = signal<'lista' | 'nueva' | 'detalle'>('lista');
    ventas = signal<Venta[]>([]);
    ventaSeleccionada = signal<Venta | null>(null);
    productos = signal<Producto[]>([]);
    clientes = signal<ClienteVenta[]>([]);
    filtro = signal<'todos' | 'cotizacion' | 'confirmada' | 'cancelada'>('todos');
    filtroOrigen = signal<'todos' | 'admin' | 'ecommerce'>('todos');
    editandoId = signal<number | null>(null);
    private textoClienteEscrito = '';

    // ── Modal crear cliente ──
    mostrandoModalCliente = signal(false);

    // ── Modal registrar pago ──
    mostrandoModalPago = signal(false);
    pagoModalMonto = signal<number>(0);
    pagoModalMetodo = signal('efectivo');
    pagoModalNotas = signal('');
    pagoModalFecha = signal('');
    guardandoPago = signal(false);
    clienteNuevoNombre = signal('');
    clienteNuevoForm!: FormGroup;

    @ViewChildren('productoInput') productoInputs!: QueryList<ElementRef>;

    ventasFiltradas = computed(() => {
        const estado = this.filtro();
        const origen = this.filtroOrigen();
        let lista = this.ventas();
        if (estado !== 'todos') lista = lista.filter(v => v.estado === estado);
        if (origen !== 'todos') lista = lista.filter(v => (v.origen ?? 'admin') === origen);
        return lista;
    });

    columnasLista = ['numero', 'fecha', 'cliente', 'total', 'estado', 'acciones'];

    ventaForm: FormGroup;

    constructor(
        private ventasService: VentasService,
        private clientesService: ClientesService,
        private productosService: ProductosService,
        private pdfService: PdfVentasService,
        private pagosService: PagosService,
        private fb: FormBuilder,
        private toast: ToastService,
        private confirm: ConfirmService,
    ) {
        this.ventaForm = this.fb.group({
            clienteId: [null, Validators.required],
            clienteNombre: [''],
            lineas: this.fb.array([]),
        });

        this.clienteNuevoForm = this.fb.group({
            nombre: ['', Validators.required],
            telefono: ['', Validators.required],
            email: [''],
            documento: [''],
        });
    }

    ngOnInit() {
        this.cargarVentas();
        this.productosService.getAll().subscribe(data => this.productos.set(data));
        this.clientesService.getAll().subscribe(data => this.clientes.set(data));
    }

    cargarVentas() {
        this.ventasService.getAll().subscribe(data => this.ventas.set(data));
    }

    get lineasArray(): FormArray {
        return this.ventaForm.get('lineas') as FormArray;
    }

    asFormGroup(control: AbstractControl): FormGroup {
        return control as FormGroup;
    }

    private crearLineaGroup(productoId: number | null = null, productoNombre = '', cantidad = 1, precioUnitario = 0): FormGroup {
        return this.fb.group({
            productoId: [productoId, Validators.required],
            productoNombre: [productoNombre],
            cantidad: [cantidad, [Validators.required, Validators.min(1)]],
            precioUnitario: [precioUnitario, [Validators.required, Validators.min(0.01)]],
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

    // ── Autocomplete productos ──
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
            linea.get('precioUnitario')?.setValue(producto.precio);
        }
    }

    onNombreProductoChange(index: number) {
        const linea = this.lineasArray.at(index) as FormGroup;
        const texto = linea.get('productoNombre')?.value ?? '';
        if (!this.productos().find(p => p.nombre === texto)) {
            linea.get('productoId')?.setValue(null);
        }
    }

    // ── Autocomplete clientes ──
    getClientesFiltrados(): ClienteVenta[] {
        const texto = (this.ventaForm.get('clienteNombre')?.value ?? '').toLowerCase();
        if (!texto) return this.clientes();
        return this.clientes().filter(c =>
            c.nombre.toLowerCase().includes(texto) ||
            (c.telefono && c.telefono.includes(texto))
        );
    }

    onClienteSeleccionado(event: MatAutocompleteSelectedEvent) {
        if (event.option.value === '__crear__') {
            const nombre = this.textoClienteEscrito.trim();
            this.clienteNuevoNombre.set(nombre);
            this.clienteNuevoForm.reset({ nombre, telefono: '', email: '', documento: '' });
            this.mostrandoModalCliente.set(true);
            // Limpiar la selección del campo para no mostrar __crear__
            this.ventaForm.get('clienteNombre')?.setValue(nombre);
            this.ventaForm.get('clienteId')?.setValue(null);
            return;
        }
        const cliente = this.clientes().find(c => c.nombre === event.option.value);
        if (cliente) this.ventaForm.get('clienteId')?.setValue(cliente.id);
    }

    cerrarModalCliente() {
        this.mostrandoModalCliente.set(false);
        this.ventaForm.get('clienteNombre')?.setValue('');
        this.ventaForm.get('clienteId')?.setValue(null);
    }

    guardarNuevoCliente() {
        if (this.clienteNuevoForm.invalid) return;
        const data = this.clienteNuevoForm.value;
        this.clientesService.crear(data).subscribe({
            next: (cliente) => {
                this.clientes.update(list => [...list, cliente]);
                this.ventaForm.get('clienteId')?.setValue(cliente.id);
                this.ventaForm.get('clienteNombre')?.setValue(cliente.nombre);
                this.mostrandoModalCliente.set(false);
                this.toast.exito(`Cliente "${cliente.nombre}" creado`);
            },
            error: (err) => this.toast.error(err.error?.message || 'No se pudo crear el cliente'),
        });
    }

    onNombreClienteChange() {
        const texto = this.ventaForm.get('clienteNombre')?.value ?? '';
        this.textoClienteEscrito = texto;
        if (!this.clientes().find(c => c.nombre === texto)) {
            this.ventaForm.get('clienteId')?.setValue(null);
        }
    }

    mostrarCrearCliente(): boolean {
        const texto = (this.ventaForm.get('clienteNombre')?.value ?? '').trim();
        if (!texto) return false;
        return !this.clientes().find(c => c.nombre.toLowerCase() === texto.toLowerCase());
    }

    // ── Cálculos ──
    calcularSubtotal(index: number): number {
        const linea = this.lineasArray.at(index).value;
        return (linea.cantidad || 0) * (linea.precioUnitario || 0);
    }

    calcularTotal(): number {
        let total = 0;
        for (let i = 0; i < this.lineasArray.length; i++) {
            total += this.calcularSubtotal(i);
        }
        return total;
    }

    stockDisponible(index: number): number {
        const productoId = (this.lineasArray.at(index) as FormGroup).get('productoId')?.value;
        return this.productos().find(p => p.id === productoId)?.stock ?? 0;
    }

    stockInsuficiente(index: number): boolean {
        const linea = this.lineasArray.at(index).value;
        if (!linea.productoId) return false;
        const disponible = this.stockDisponible(index);
        return disponible === 0 || linea.cantidad > disponible;
    }

    hayStockInsuficiente(): boolean {
        for (let i = 0; i < this.lineasArray.length; i++) {
            if (this.stockInsuficiente(i)) return true;
        }
        return false;
    }

    // ── Navegación ──
    irANueva() {
        this.editandoId.set(null);
        this.ventaForm.reset();
        while (this.lineasArray.length > 0) this.lineasArray.removeAt(0);
        this.agregarLinea();
        this.vista.set('nueva');
    }

    irAEditar(venta: Venta) {
        this.editandoId.set(venta.id);
        this.ventaForm.reset({
            clienteId: venta.cliente?.id ?? null,
            clienteNombre: venta.cliente?.nombre ?? venta.clienteNombre,
        });
        while (this.lineasArray.length > 0) this.lineasArray.removeAt(0);
        for (const item of venta.items ?? []) {
            this.lineasArray.push(this.crearLineaGroup(
                item.producto?.id ?? null,
                item.producto?.nombre ?? '',
                item.cantidad,
                item.precioUnitario,
            ));
        }
        this.vista.set('nueva');
    }

    volver() {
        this.ventaSeleccionada.set(null);
        this.editandoId.set(null);
        this.vista.set('lista');
    }

    // ── CRUD ──
    guardarCotizacion() {
        if (this.ventaForm.invalid || this.lineasArray.length === 0) return;
        const { clienteId, clienteNombre, lineas } = this.ventaForm.value;

        for (const linea of lineas) {
            const producto = this.productos().find(p => p.id === linea.productoId);
            if (producto && producto.stock === 0) {
                this.toast.error(`"${producto.nombre}" no tiene stock disponible`);
                return;
            }
            if (producto && linea.cantidad > producto.stock) {
                this.toast.error(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`);
                return;
            }
        }

        const dto = {
            clienteNombre,
            clienteId,
            items: lineas.map((l: any) => ({
                productoId: l.productoId,
                cantidad: l.cantidad,
                precioUnitario: l.precioUnitario,
            })),
        };

        const id = this.editandoId();
        if (id) {
            this.ventasService.actualizar(id, dto).subscribe({
                next: (actualizada) => {
                    this.toast.exito('Cotización actualizada correctamente');
                    this.cargarVentas();
                    this.ventaSeleccionada.set(actualizada);
                    this.vista.set('detalle');
                },
                error: (err) => this.toast.error(err.error?.message || 'Error al actualizar la cotización'),
            });
        } else {
            this.ventasService.crear(dto).subscribe({
                next: () => {
                    this.toast.exito('Cotización creada correctamente');
                    this.cargarVentas();
                    this.vista.set('lista');
                },
                error: (err) => this.toast.error(err.error?.message || 'Error al crear la cotización'),
            });
        }
    }

    verDetalle(venta: Venta) {
        this.ventasService.getById(venta.id).subscribe(data => {
            this.ventaSeleccionada.set(data);
            this.vista.set('detalle');
        });
    }

    confirmar() {
        const venta = this.ventaSeleccionada()!;
        this.ventasService.confirmar(venta.id).subscribe({
            next: (actualizada) => {
                this.toast.exito(`${actualizada.numero} confirmada — stock descontado`);
                this.ventaSeleccionada.set(actualizada);
                this.cargarVentas();
            },
            error: (err) => this.toast.error(err.error?.message || 'Error al confirmar'),
        });
    }

    cancelar() {
        const venta = this.ventaSeleccionada()!;
        this.ventasService.cancelar(venta.id).subscribe({
            next: (actualizada) => {
                this.toast.exito('Cotización cancelada');
                this.ventaSeleccionada.set(actualizada);
                this.cargarVentas();
            },
            error: (err) => this.toast.error(err.error?.message || 'Error al cancelar'),
        });
    }

    anular() {
        const venta = this.ventaSeleccionada()!;
        this.confirm.confirm({
            titulo: `Anular ${venta.numero}`,
            mensaje: 'El stock de todos los productos será devuelto al inventario. Esta acción no se puede deshacer.',
            textoConfirmar: 'Anular factura',
            tipo: 'peligro',
        }, () => {
            this.ventasService.anular(venta.id).subscribe({
                next: (actualizada) => {
                    this.toast.exito(`Factura ${actualizada.numero} anulada — stock devuelto`);
                    this.ventaSeleccionada.set(actualizada);
                    this.cargarVentas();
                },
                error: (err) => this.toast.error(err.error?.message || 'Error al anular la factura'),
            });
        });
    }

    reactivar() {
        const venta = this.ventaSeleccionada()!;
        this.ventasService.reactivar(venta.id).subscribe({
            next: (actualizada) => {
                this.toast.exito('Cotización reactivada correctamente');
                this.ventaSeleccionada.set(actualizada);
                this.cargarVentas();
            },
            error: (err) => this.toast.error(err.error?.message || 'Error al reactivar'),
        });
    }

    // ── Pago desde detalle ──
    abrirModalPago() {
        const venta = this.ventaSeleccionada()!;
        this.pagoModalMonto.set(venta.saldo ?? venta.total);
        this.pagoModalMetodo.set('efectivo');
        this.pagoModalNotas.set(venta.numero ?? '');
        this.pagoModalFecha.set(new Date().toISOString().split('T')[0]);
        this.mostrandoModalPago.set(true);
    }

    cerrarModalPago() {
        this.mostrandoModalPago.set(false);
    }

    crearPago() {
        const venta = this.ventaSeleccionada()!;
        const monto = this.pagoModalMonto();
        if (!monto || monto <= 0) { this.toast.error('Ingresa un monto válido'); return; }

        this.guardandoPago.set(true);
        this.pagosService.registrar(venta.id, monto, this.pagoModalMetodo(), this.pagoModalNotas() || undefined)
            .subscribe({
                next: () => {
                    this.toast.exito('Pago registrado correctamente');
                    this.mostrandoModalPago.set(false);
                    this.guardandoPago.set(false);
                    this.ventasService.getById(venta.id).subscribe(v => {
                        this.ventaSeleccionada.set(v);
                        this.ventas.update(list => list.map(x => x.id === v.id ? v : x));
                    });
                },
                error: (err) => {
                    this.toast.error(err.error?.message || 'Error al registrar el pago');
                    this.guardandoPago.set(false);
                },
            });
    }

    eliminarCotizacion() {
        const venta = this.ventaSeleccionada()!;
        this.confirm.confirm({
            titulo: `Eliminar ${venta.numero}`,
            mensaje: 'Esta acción no se puede deshacer.',
            textoConfirmar: 'Eliminar',
            tipo: 'peligro',
        }, () => {
            this.ventasService.eliminar(venta.id).subscribe({
                next: () => {
                    this.toast.exito(`Cotización ${venta.numero} eliminada`);
                    this.cargarVentas();
                    this.volver();
                },
                error: (err) => this.toast.error(err.error?.message || 'Error al eliminar la cotización'),
            });
        });
    }

    descargarProforma() {
        this.pdfService.descargarProforma(this.ventaSeleccionada()!);
    }

    descargarFactura() {
        this.pdfService.descargarFactura(this.ventaSeleccionada()!);
    }

    descargarOrden() {
        this.pdfService.descargarOrdenEntrega(this.ventaSeleccionada()!);
    }

    getImagenUrl(imagen: string): string {
        return `${environment.apiUrl}/uploads/${imagen}`;
    }
}
