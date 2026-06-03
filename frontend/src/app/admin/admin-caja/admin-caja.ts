import { Component, OnInit, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PagosService, ResumenCaja, PagoDetalle } from './pagos.service';
import { Venta, Pago } from '../admin-ventas/venta.interface';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmService } from '../../shared/confirm/confirm.service';
import { environment } from '../../../environments/environment';

type FiltroEstadoPago = 'todos' | 'pendiente' | 'abonado' | 'pagado';
type Periodo = 'hoy' | 'mes' | 'mes_anterior' | 'personalizado';

@Component({
    selector: 'app-admin-caja',
    imports: [CurrencyPipe, DatePipe, FormsModule],
    templateUrl: './admin-caja.html',
    styleUrl: './admin-caja.css',
})
export class AdminCaja implements OnInit {
    vista = signal<'lista' | 'detalle' | 'caja'>('lista');
    ventas = signal<Venta[]>([]);
    ventaSeleccionada = signal<Venta | null>(null);
    pagosVenta = signal<Pago[]>([]);
    resumen = signal<ResumenCaja | null>(null);

    // Vista caja por método
    cajaMetodo = signal<string | null>(null);
    pagosCaja = signal<PagoDetalle[]>([]);
    cargandoCaja = signal(false);
    totalCaja = computed(() => this.pagosCaja().reduce((s, p) => s + Number(p.monto), 0));

    filtro = signal<FiltroEstadoPago>('todos');
    periodo = signal<Periodo>('mes');
    desde = signal('');
    hasta = signal('');

    cargandoVentas = signal(false);
    cargandoResumen = signal(false);
    guardandoPago = signal(false);

    // Formulario de nuevo pago
    pagoMonto = signal<number | null>(null);
    pagoMetodo = signal<string>('efectivo');
    pagoNotas = signal('');

    ventasFiltradas = computed(() => {
        const f = this.filtro();
        const todas = this.ventas().filter(v => v.estado === 'confirmada');
        if (f === 'todos') return todas;
        return todas.filter(v => v.estadoPago === f);
    });

    constructor(
        private pagosService: PagosService,
        private http: HttpClient,
        private toast: ToastService,
        private confirmService: ConfirmService,
    ) {}

    ngOnInit() {
        this.cargarVentas();
        this.aplicarPeriodo('mes');
    }

    cargarVentas() {
        this.cargandoVentas.set(true);
        this.http.get<Venta[]>(`${environment.apiUrl}/ventas`).subscribe({
            next: (data) => {
                this.ventas.set(data);
                this.cargandoVentas.set(false);
            },
            error: () => this.cargandoVentas.set(false),
        });
    }

    aplicarPeriodo(p: Periodo) {
        this.periodo.set(p);
        if (p === 'personalizado') return;

        const hoy = new Date();
        let inicio: Date;
        let fin: Date = new Date(hoy);

        if (p === 'hoy') {
            inicio = new Date(hoy);
        } else if (p === 'mes') {
            inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        } else {
            inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
            fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        }

        this.desde.set(this.toInputDate(inicio));
        this.hasta.set(this.toInputDate(fin));
        this.cargarResumen();
    }

    cargarResumen() {
        if (!this.desde() || !this.hasta()) return;
        this.cargandoResumen.set(true);
        this.pagosService.getResumenCaja(this.desde(), this.hasta()).subscribe({
            next: (data) => { this.resumen.set(data); this.cargandoResumen.set(false); },
            error: () => this.cargandoResumen.set(false),
        });
    }

    verDetalle(venta: Venta) {
        this.ventaSeleccionada.set(venta);
        this.pagosVenta.set([]);
        this.pagoMonto.set(null);
        this.pagoNotas.set('');
        this.pagoMetodo.set('efectivo');
        this.pagosService.getByVenta(venta.id).subscribe(p => this.pagosVenta.set(p));
        this.vista.set('detalle');
    }

    volver() {
        this.ventaSeleccionada.set(null);
        this.vista.set('lista');
    }

    registrarPago() {
        const venta = this.ventaSeleccionada()!;
        const monto = this.pagoMonto();
        if (!monto || monto <= 0) { this.toast.error('Ingresa un monto válido'); return; }
        if (monto > venta.saldo + 0.01) {
            this.toast.error(`El monto supera el saldo pendiente (${venta.saldo.toFixed(0)})`);
            return;
        }

        this.guardandoPago.set(true);
        this.pagosService.registrar(venta.id, monto, this.pagoMetodo(), this.pagoNotas() || undefined)
            .subscribe({
                next: () => {
                    this.toast.exito('Pago registrado correctamente');
                    this.pagoMonto.set(null);
                    this.pagoNotas.set('');
                    // Recargar venta y pagos
                    this.http.get<Venta>(`${environment.apiUrl}/ventas/${venta.id}`).subscribe(v => {
                        this.ventaSeleccionada.set(v);
                        this.ventas.update(list => list.map(x => x.id === v.id ? v : x));
                    });
                    this.pagosService.getByVenta(venta.id).subscribe(p => this.pagosVenta.set(p));
                    this.cargarResumen();
                    this.guardandoPago.set(false);
                },
                error: (err) => {
                    this.toast.error(err.error?.message || 'Error al registrar el pago');
                    this.guardandoPago.set(false);
                },
            });
    }

    eliminarPago(pago: Pago) {
        this.confirmService.confirm({
            titulo: 'Eliminar pago',
            mensaje: `${pago.metodo.charAt(0).toUpperCase() + pago.metodo.slice(1)} por $${Number(pago.monto).toLocaleString('es-CO')}. El saldo pendiente se ajustará.`,
            textoConfirmar: 'Eliminar',
            tipo: 'peligro',
        }, () => {
            this.pagosService.eliminar(pago.id).subscribe({
                next: () => {
                    this.toast.exito('Pago eliminado');
                    const venta = this.ventaSeleccionada()!;
                    this.http.get<Venta>(`${environment.apiUrl}/ventas/${venta.id}`).subscribe(v => {
                        this.ventaSeleccionada.set(v);
                        this.ventas.update(list => list.map(x => x.id === v.id ? v : x));
                    });
                    this.pagosService.getByVenta(venta.id).subscribe(p => this.pagosVenta.set(p));
                    this.cargarResumen();
                },
                error: () => this.toast.error('Error al eliminar el pago'),
            });
        });
    }

    entrarCaja(metodo: string) {
        this.cajaMetodo.set(metodo);
        this.pagosCaja.set([]);
        this.cargandoCaja.set(true);
        this.pagosService.getByMetodo(metodo, this.desde(), this.hasta()).subscribe({
            next: (p) => { this.pagosCaja.set(p); this.cargandoCaja.set(false); },
            error: () => { this.cargandoCaja.set(false); this.toast.error('Error al cargar los pagos'); },
        });
        this.vista.set('caja');
    }

    salirCaja() {
        this.cajaMetodo.set(null);
        this.vista.set('lista');
    }

    labelMetodo(m: string): string {
        const map: Record<string, string> = { efectivo: '💵 Efectivo', nequi: '📱 Nequi', daviplata: '📲 Daviplata' };
        return map[m] ?? m;
    }

    iconoMetodo(m: string): string {
        const map: Record<string, string> = { efectivo: '💵', nequi: '📱', daviplata: '📲' };
        return map[m] ?? '💳';
    }

    nombreMetodo(m: string): string {
        const map: Record<string, string> = { efectivo: 'Efectivo', nequi: 'Nequi', daviplata: 'Daviplata' };
        return map[m] ?? m;
    }

    labelEstadoPago(ep: string): string {
        const map: Record<string, string> = { pendiente: 'Pendiente', abonado: 'Abonado', pagado: 'Pagado' };
        return map[ep] ?? ep;
    }

    contarFiltro(f: FiltroEstadoPago): number {
        const confirmadas = this.ventas().filter(v => v.estado === 'confirmada');
        if (f === 'todos') return confirmadas.length;
        return confirmadas.filter(v => v.estadoPago === f).length;
    }

    private toInputDate(d: Date): string {
        return d.toISOString().split('T')[0];
    }
}
