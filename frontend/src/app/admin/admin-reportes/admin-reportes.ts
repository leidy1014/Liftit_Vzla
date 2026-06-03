import { Component, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GastosService, ResumenGastos } from '../admin-gastos/gastos.service';
import { environment } from '../../../environments/environment';

interface FilaMargen {
    id: number;
    numero: string;
    cliente: string;
    fecha: string;
    totalVenta: number;
    costoTotal: number;
    margen: number;
    margenPct: number;
}

interface ResumenMargen {
    totalVentas: number;
    totalCosto: number;
    totalMargen: number;
    margenPromedio: number;
}

type Periodo = 'mes' | 'mes_anterior' | 'anio' | 'personalizado';

@Component({
    selector: 'app-admin-reportes',
    imports: [CurrencyPipe, DatePipe, FormsModule],
    templateUrl: './admin-reportes.html',
    styleUrl: './admin-reportes.css',
})
export class AdminReportes {
    cargando = signal(false);
    filas = signal<FilaMargen[]>([]);
    resumen = signal<ResumenMargen | null>(null);
    resumenGastos = signal<ResumenGastos | null>(null);
    periodo = signal<Periodo>('mes');
    desde = signal('');
    hasta = signal('');
    ordenCol = signal<keyof FilaMargen>('fecha');
    ordenAsc = signal(false);

    filasOrdenadas = computed(() => {
        const col = this.ordenCol();
        const asc = this.ordenAsc();
        return [...this.filas()].sort((a, b) => {
            const va = a[col] as any;
            const vb = b[col] as any;
            if (va < vb) return asc ? -1 : 1;
            if (va > vb) return asc ? 1 : -1;
            return 0;
        });
    });

    utilidadNeta = computed(() => {
        const r = this.resumen();
        const g = this.resumenGastos();
        if (!r) return 0;
        return r.totalMargen - (g?.total ?? 0);
    });

    utilidadNetaPct = computed(() => {
        const r = this.resumen();
        if (!r || r.totalVentas === 0) return 0;
        return Math.round((this.utilidadNeta() / r.totalVentas) * 100);
    });

    constructor(private http: HttpClient, private gastosService: GastosService) {
        this.aplicarPeriodo('mes');
    }

    aplicarPeriodo(p: Periodo) {
        this.periodo.set(p);
        if (p === 'personalizado') return;

        const hoy = new Date();
        let inicio: Date;
        let fin: Date = new Date(hoy);

        if (p === 'mes') {
            inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        } else if (p === 'mes_anterior') {
            inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
            fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        } else {
            inicio = new Date(hoy.getFullYear(), 0, 1);
        }

        this.desde.set(this.toInputDate(inicio));
        this.hasta.set(this.toInputDate(fin));
        this.cargar();
    }

    cargar() {
        if (!this.desde() || !this.hasta()) return;
        this.cargando.set(true);

        let pendientes = 2;
        const listo = () => { if (--pendientes === 0) this.cargando.set(false); };

        this.http.get<{ filas: FilaMargen[]; resumen: ResumenMargen }>(
            `${environment.apiUrl}/ventas/reporte/margenes?desde=${this.desde()}&hasta=${this.hasta()}`
        ).subscribe({
            next: (data) => { this.filas.set(data.filas); this.resumen.set(data.resumen); listo(); },
            error: () => listo(),
        });

        this.gastosService.getResumen(this.desde(), this.hasta()).subscribe({
            next: (g) => { this.resumenGastos.set(g); listo(); },
            error: () => { this.resumenGastos.set(null); listo(); },
        });
    }

    ordenarPor(col: keyof FilaMargen) {
        if (this.ordenCol() === col) {
            this.ordenAsc.update(v => !v);
        } else {
            this.ordenCol.set(col);
            this.ordenAsc.set(false);
        }
    }

    claseMargen(pct: number): string {
        if (pct >= 30) return 'margen-alto';
        if (pct >= 15) return 'margen-medio';
        return 'margen-bajo';
    }

    private toInputDate(d: Date): string {
        return d.toISOString().split('T')[0];
    }
}
