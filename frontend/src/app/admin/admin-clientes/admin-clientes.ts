import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { ClientesService } from '../admin-ventas/clientes.service';
import { VentasService } from '../admin-ventas/ventas.service';
import { ClienteVenta, Venta } from '../admin-ventas/venta.interface';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmService } from '../../shared/confirm/confirm.service';

@Component({
    selector: 'app-admin-clientes',
    imports: [
        ReactiveFormsModule,
        MatTableModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        DatePipe,
        CurrencyPipe,
    ],
    templateUrl: './admin-clientes.html',
    styleUrl: './admin-clientes.css',
})
export class AdminClientes implements OnInit {
    clientes = signal<ClienteVenta[]>([]);
    clienteSeleccionado = signal<ClienteVenta | null>(null);
    ventasCliente = signal<Venta[]>([]);
    editandoCliente = signal<ClienteVenta | null>(null);
    busqueda = signal('');

    clienteForm: FormGroup;

    constructor(
        private clientesService: ClientesService,
        private ventasService: VentasService,
        private fb: FormBuilder,
        private toast: ToastService,
        private confirm: ConfirmService,
    ) {
        this.clienteForm = this.fb.group({
            nombre: ['', Validators.required],
            telefono: ['', Validators.required],
            email: [''],
            documento: [''],
        });
    }

    ngOnInit() {
        this.cargarClientes();
    }

    cargarClientes() {
        this.clientesService.getAll().subscribe(data => this.clientes.set(data));
    }

    get clientesFiltrados(): ClienteVenta[] {
        const texto = this.busqueda().toLowerCase();
        if (!texto) return this.clientes();
        return this.clientes().filter(c =>
            c.nombre.toLowerCase().includes(texto) ||
            c.telefono.includes(texto) ||
            (c.email && c.email.toLowerCase().includes(texto))
        );
    }

    seleccionarCliente(cliente: ClienteVenta) {
        this.clienteSeleccionado.set(cliente);
        this.ventasService.getByCliente(cliente.id).subscribe(data => this.ventasCliente.set(data));
    }

    abrirNuevoCliente() {
        this.editandoCliente.set(null);
        this.clienteForm.reset();
    }

    editarCliente(cliente: ClienteVenta) {
        this.editandoCliente.set(cliente);
        this.clienteForm.setValue({
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email ?? '',
            documento: cliente.documento ?? '',
        });
    }

    guardarCliente() {
        if (this.clienteForm.invalid) return;
        const data = this.clienteForm.value;
        const editando = this.editandoCliente();

        const obs = editando
            ? this.clientesService.actualizar(editando.id, data)
            : this.clientesService.crear(data);

        obs.subscribe({
            next: () => {
                this.toast.exito(editando ? 'Cliente actualizado' : 'Cliente creado');
                this.cargarClientes();
                this.editandoCliente.set(null);
                this.clienteForm.reset();
            },
            error: (err) => this.toast.error(err.error?.message || 'Error al guardar cliente'),
        });
    }

    eliminarCliente(id: number) {
        this.confirm.confirm({
            titulo: 'Desactivar cliente',
            mensaje: 'El cliente no aparecerá en las búsquedas. Podrás reactivarlo después.',
            textoConfirmar: 'Desactivar',
            tipo: 'peligro',
        }, () => {
            this.clientesService.eliminar(id).subscribe({
                next: () => {
                    this.toast.exito('Cliente desactivado');
                    if (this.clienteSeleccionado()?.id === id) this.clienteSeleccionado.set(null);
                    this.cargarClientes();
                },
                error: (err) => this.toast.error(err.error?.message || 'Error'),
            });
        });
    }

    borrarCliente(id: number) {
        this.confirm.confirm({
            titulo: 'Eliminar cliente',
            mensaje: 'Esta acción no se puede deshacer. El cliente y su historial se eliminarán permanentemente.',
            textoConfirmar: 'Eliminar',
            tipo: 'peligro',
        }, () => {
            this.clientesService.borrarPermanente(id).subscribe({
                next: () => {
                    this.toast.exito('Cliente eliminado');
                    if (this.clienteSeleccionado()?.id === id) this.clienteSeleccionado.set(null);
                    this.cargarClientes();
                },
                error: (err) => this.toast.error(err.error?.message || 'Error'),
            });
        });
    }

    estadoPago(v: { total: number; montoPagado: number }): 'pagado' | 'abonado' | 'pendiente' {
        const pagado = Number(v.montoPagado);
        const total  = Number(v.total);
        if (pagado >= total) return 'pagado';
        if (pagado > 0)      return 'abonado';
        return 'pendiente';
    }

    saldoPendienteTotal(): number {
        return this.ventasCliente()
            .filter(v => v.estado === 'confirmada')
            .reduce((s, v) => s + Math.max(Number(v.total) - Number(v.montoPagado), 0), 0);
    }

    estadoTexto(estado: string): string {
        switch (estado) {
            case 'cotizacion': return 'Cotización';
            case 'confirmada': return 'Confirmada';
            case 'cancelada': return 'Cancelada';
            case 'anulada': return 'Anulada';
            default: return estado;
        }
    }
}
