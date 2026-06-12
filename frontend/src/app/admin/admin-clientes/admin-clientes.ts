import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ClientesService } from './clientes.service';
import { Cliente } from './cliente.interface';
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
    ],
    templateUrl: './admin-clientes.html',
    styleUrl: './admin-clientes.css',
})
export class AdminClientes implements OnInit {
    clientes = signal<Cliente[]>([]);
    editandoCliente = signal<Cliente | null>(null);
    busqueda = signal('');

    clienteForm: FormGroup;

    constructor(
        private clientesService: ClientesService,
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
        this.clientesService.getAll().subscribe((data: Cliente[]) => this.clientes.set(data));
    }

    get clientesFiltrados(): Cliente[] {
        const texto = this.busqueda().toLowerCase();
        if (!texto) return this.clientes();
        return this.clientes().filter(c =>
            c.nombre.toLowerCase().includes(texto) ||
            c.telefono.includes(texto) ||
            (c.email && c.email.toLowerCase().includes(texto))
        );
    }

    abrirNuevoCliente() {
        this.editandoCliente.set(null);
        this.clienteForm.reset();
    }

    editarCliente(cliente: Cliente) {
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
            error: (err: any) => this.toast.error(err.error?.message || 'Error al guardar cliente'),
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
                    this.cargarClientes();
                },
                error: (err: any) => this.toast.error(err.error?.message || 'Error'),
            });
        });
    }

    borrarCliente(id: number) {
        this.confirm.confirm({
            titulo: 'Eliminar cliente',
            mensaje: 'Esta acción no se puede deshacer.',
            textoConfirmar: 'Eliminar',
            tipo: 'peligro',
        }, () => {
            this.clientesService.borrarPermanente(id).subscribe({
                next: () => {
                    this.toast.exito('Cliente eliminado');
                    this.cargarClientes();
                },
                error: (err: any) => this.toast.error(err.error?.message || 'Error'),
            });
        });
    }
}
