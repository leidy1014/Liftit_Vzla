import { Component, OnInit, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GastosService, Gasto, ResumenGastos, CATEGORIAS_GASTO, COLORES_CATEGORIA } from './gastos.service';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmService } from '../../shared/confirm/confirm.service';

type Periodo = 'mes' | 'mes_anterior' | 'anio' | 'personalizado';

@Component({
    selector: 'app-admin-gastos',
    imports: [CurrencyPipe, DatePipe, FormsModule, KeyValuePipe],
    templateUrl: './admin-gastos.html',
    styleUrl: './admin-gastos.css',
})
export class AdminGastos implements OnInit {
    gastos = signal<Gasto[]>([]);
    resumen = signal<ResumenGastos | null>(null);
    cargando = signal(false);
    guardando = signal(false);

    periodo = signal<Periodo>('mes');
    desde = signal('');
    hasta = signal('');

    editandoId = signal<number | null>(null);

    // Formulario
    form = {
        descripcion: '',
        monto: null as number | null,
        categoria: 'Varios',
        metodoPago: 'efectivo',
        fecha: this.hoy(),
    };

    categorias = CATEGORIAS_GASTO;
    colores = COLORES_CATEGORIA;
    metodos = [
        { valor: 'efectivo',      label: '💵 Efectivo' },
        { valor: 'nequi',         label: '📱 Nequi' },
        { valor: 'daviplata',     label: '📲 Daviplata' },
        { valor: 'transferencia', label: '🏦 Transferencia' },
    ];

    totalGastosLista = computed(() =>
        this.gastos().reduce((s, g) => s + Number(g.monto), 0)
    );

    constructor(
        private gastosService: GastosService,
        private toast: ToastService,
        private confirm: ConfirmService,
    ) {}

    ngOnInit() {
        this.aplicarPeriodo('mes');
    }

    aplicarPeriodo(p: Periodo) {
        this.periodo.set(p);
        if (p === 'personalizado') return;

        const hoy = new Date();
        let inicio: Date;
        let fin = new Date(hoy);

        if (p === 'mes') {
            inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        } else if (p === 'mes_anterior') {
            inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
            fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        } else {
            inicio = new Date(hoy.getFullYear(), 0, 1);
        }

        this.desde.set(this.toDateStr(inicio));
        this.hasta.set(this.toDateStr(fin));
        this.cargar();
    }

    cargar() {
        if (!this.desde() || !this.hasta()) return;
        this.cargando.set(true);
        this.gastosService.getAll(this.desde(), this.hasta()).subscribe({
            next: (data) => { this.gastos.set(data); this.cargando.set(false); },
            error: () => this.cargando.set(false),
        });
        this.gastosService.getResumen(this.desde(), this.hasta()).subscribe(r => this.resumen.set(r));
    }

    guardar() {
        if (!this.form.descripcion.trim()) { this.toast.error('Ingresa una descripción'); return; }
        if (!this.form.monto || this.form.monto <= 0) { this.toast.error('Ingresa un monto válido'); return; }

        const dto = {
            descripcion: this.form.descripcion.trim(),
            monto: this.form.monto,
            categoria: this.form.categoria,
            metodoPago: this.form.metodoPago,
            fecha: this.form.fecha,
        };

        this.guardando.set(true);
        const id = this.editandoId();

        const req = id
            ? this.gastosService.actualizar(id, dto)
            : this.gastosService.crear(dto);

        req.subscribe({
            next: () => {
                this.toast.exito(id ? 'Gasto actualizado' : 'Gasto registrado');
                this.resetForm();
                this.cargar();
                this.guardando.set(false);
            },
            error: (err) => {
                this.toast.error(err.error?.message || 'Error al guardar');
                this.guardando.set(false);
            },
        });
    }

    editar(g: Gasto) {
        this.editandoId.set(g.id);
        this.form.descripcion = g.descripcion;
        this.form.monto = Number(g.monto);
        this.form.categoria = g.categoria;
        this.form.metodoPago = g.metodoPago;
        this.form.fecha = g.fecha;
    }

    cancelarEdicion() {
        this.resetForm();
    }

    eliminar(g: Gasto) {
        this.confirm.confirm({
            titulo: 'Eliminar gasto',
            mensaje: `"${g.descripcion}" — ${Number(g.monto).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}`,
            textoConfirmar: 'Eliminar',
            tipo: 'peligro',
        }, () => {
            this.gastosService.eliminar(g.id).subscribe({
                next: () => { this.toast.exito('Gasto eliminado'); this.cargar(); },
                error: () => this.toast.error('Error al eliminar'),
            });
        });
    }

    porcentajeCategoria(monto: number): number {
        const total = this.resumen()?.total ?? 0;
        if (total === 0) return 0;
        return Math.round((monto / total) * 100);
    }

    colorCategoria(cat: string): string {
        return this.colores[cat] ?? '#9e9e9e';
    }

    labelMetodo(m: string): string {
        return this.metodos.find(x => x.valor === m)?.label ?? m;
    }

    private resetForm() {
        this.editandoId.set(null);
        this.form.descripcion = '';
        this.form.monto = null;
        this.form.categoria = 'Varios';
        this.form.metodoPago = 'efectivo';
        this.form.fecha = this.hoy();
    }

    private hoy(): string {
        return new Date().toISOString().split('T')[0];
    }

    private toDateStr(d: Date): string {
        return d.toISOString().split('T')[0];
    }
}
