import { Component, OnInit, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VentasService } from '../admin-ventas/ventas.service';
import { ComprasService } from '../admin-compras/compras.service';
import { ProductosService } from '../../productos/productos';
import { ClientesService } from '../admin-ventas/clientes.service';
import { Venta } from '../admin-ventas/venta.interface';
import { Compra } from '../admin-compras/compra.interface';
import { Producto } from '../../productos/producto.interface';
import { ClienteVenta } from '../admin-ventas/venta.interface';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-admin-dashboard',
    imports: [CurrencyPipe, DatePipe, RouterLink],
    templateUrl: './admin-dashboard.html',
    styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
    ventas = signal<Venta[]>([]);
    compras = signal<Compra[]>([]);
    productos = signal<Producto[]>([]);
    clientes = signal<ClienteVenta[]>([]);
    cargando = signal(true);

    constructor(
        private ventasService: VentasService,
        private comprasService: ComprasService,
        private productosService: ProductosService,
        private clientesService: ClientesService,
    ) {}

    ngOnInit() {
        let pendientes = 4;
        const listo = () => { if (--pendientes === 0) this.cargando.set(false); };

        this.ventasService.getAll().subscribe(d => { this.ventas.set(d); listo(); });
        this.comprasService.getAll().subscribe(d => { this.compras.set(d); listo(); });
        this.productosService.getAll().subscribe(d => { this.productos.set(d); listo(); });
        this.clientesService.getAll().subscribe(d => { this.clientes.set(d); listo(); });
    }

    // ── KPIs ──────────────────────────────────────────────────────────
    ventasMes = computed(() => {
        const ahora = new Date();
        return this.ventas()
            .filter(v => {
                if (v.estado !== 'confirmada') return false;
                const f = new Date(v.fecha);
                return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
            })
            .reduce((s, v) => s + +v.total, 0);
    });

    cotizacionesPendientes = computed(() =>
        this.ventas().filter(v => v.estado === 'cotizacion').length
    );

    valorCotizaciones = computed(() =>
        this.ventas().filter(v => v.estado === 'cotizacion').reduce((s, v) => s + +v.total, 0)
    );

    comprasPendientesCount = computed(() =>
        this.compras().filter(c => c.estado === 'pedido').length
    );

    valorComprasPendientes = computed(() =>
        this.compras().filter(c => c.estado === 'pedido').reduce((s, c) => s + +c.total, 0)
    );

    totalClientes = computed(() => this.clientes().length);

    // ── Alertas de stock ───────────────────────────────────────────────
    productosAgotados = computed(() =>
        this.productos().filter(p => p.stock === 0)
    );

    productosStockBajo = computed(() =>
        this.productos().filter(p => p.stock > 0 && p.stock <= (p.stockMinimo || 5))
            .sort((a, b) => a.stock - b.stock)
    );

    // ── Actividad reciente ─────────────────────────────────────────────
    ultimasVentas = computed(() =>
        [...this.ventas()]
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .slice(0, 6)
    );

    comprasPendientesList = computed(() =>
        this.compras()
            .filter(c => c.estado === 'pedido')
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    );

    // ── Gráfico 7 días ─────────────────────────────────────────────────
    ventasPorDia = computed(() => {
        const dias: { label: string; total: number }[] = [];
        const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        for (let i = 6; i >= 0; i--) {
            const inicio = new Date();
            inicio.setDate(inicio.getDate() - i);
            inicio.setHours(0, 0, 0, 0);
            const fin = new Date(inicio);
            fin.setHours(23, 59, 59, 999);

            const label = i === 0 ? 'Hoy' : `${DIAS_ES[inicio.getDay()]} ${inicio.getDate()}`;
            const total = this.ventas()
                .filter(v => {
                    if (v.estado !== 'confirmada') return false;
                    const f = new Date(v.fecha);
                    return f >= inicio && f <= fin;
                })
                .reduce((s, v) => s + +v.total, 0);

            dias.push({ label, total });
        }
        return dias;
    });

    maxVentaDia = computed(() =>
        Math.max(...this.ventasPorDia().map(d => d.total), 1)
    );

    barHeight(total: number): number {
        if (total === 0) return 3;
        return Math.max((total / this.maxVentaDia()) * 130, 8);
    }

    totalVentas7Dias = computed(() =>
        this.ventasPorDia().reduce((s, d) => s + d.total, 0)
    );

    // ── Helpers ────────────────────────────────────────────────────────
    estadoVentaTexto(estado: string): string {
        const mapa: Record<string, string> = {
            cotizacion: 'Cotización', confirmada: 'Confirmada',
            cancelada: 'Cancelada', anulada: 'Anulada',
        };
        return mapa[estado] ?? estado;
    }

    fechaHoy(): string {
        return new Date().toLocaleDateString('es-CO', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });
    }

    getImagenUrl(imagen: string): string {
        return `${environment.apiUrl}/uploads/${imagen}`;
    }
}
