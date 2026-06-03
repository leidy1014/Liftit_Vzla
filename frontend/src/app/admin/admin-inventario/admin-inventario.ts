import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { InventarioService } from './inventario.service';
import { ProductosService } from '../../productos/productos';
import { Producto } from '../../productos/producto.interface';
import { Existencia, KardexDetalle, Movimiento } from './movimiento.interface';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
    selector: 'app-admin-inventario',
    imports: [
        ReactiveFormsModule,
        MatTableModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTabsModule,
        DatePipe,
        CurrencyPipe,
        NgApexchartsModule,
    ],
    templateUrl: './admin-inventario.html',
    styleUrl: './admin-inventario.css',
})
export class AdminInventario implements OnInit {
    productos = signal<Producto[]>([]);
    existencias = signal<Existencia[]>([]);
    recepciones = signal<Movimiento[]>([]);
    movimientosInternos = signal<Movimiento[]>([]);
    kardexDetalle = signal<KardexDetalle | null>(null);

    columnasExistencias = ['imagen', 'nombre', 'categoria', 'costo', 'valorTotal', 'principal', 'averias', 'acciones'];
    columnasMovimientos = ['fecha', 'producto', 'cantidad', 'ubicacion', 'motivo'];

    recepcionForm: FormGroup;
    movimientoForm: FormGroup;

    chartOptions: any = {};

    constructor(
        private inventarioService: InventarioService,
        private productosService: ProductosService,
        private fb: FormBuilder,
        private toast: ToastService,
    ) {
        this.recepcionForm = this.fb.group({
            productoId: [null, Validators.required],
            cantidad: [1, [Validators.required, Validators.min(1)]],
            motivo: [''],
        });

        this.movimientoForm = this.fb.group({
            productoId: [null, Validators.required],
            origen: ['principal', Validators.required],
            destino: ['averias', Validators.required],
            cantidad: [1, [Validators.required, Validators.min(1)]],
            motivo: [''],
        });
    }

    ngOnInit() {
        this.cargarProductos();
        this.cargarExistencias();
        this.cargarRecepciones();
        this.cargarMovimientosInternos();
    }

    cargarProductos() {
        this.productosService.getAll().subscribe(data => this.productos.set(data));
    }

    cargarExistencias() {
        this.inventarioService.getExistencias().subscribe(data => this.existencias.set(data));
    }

    cargarRecepciones() {
        this.inventarioService.getRecepciones().subscribe(data => this.recepciones.set(data));
    }

    cargarMovimientosInternos() {
        this.inventarioService.getMovimientosInternos().subscribe(data => this.movimientosInternos.set(data));
    }

    registrarRecepcion() {
        if (this.recepcionForm.invalid) return;
        const { productoId, cantidad, motivo } = this.recepcionForm.value;
        this.inventarioService.registrarRecepcion(productoId, cantidad, motivo).subscribe({
            next: () => {
                this.toast.exito('Recepción registrada');
                this.recepcionForm.reset({ cantidad: 1 });
                this.cargarExistencias();
                this.cargarRecepciones();
            },
            error: (err) => this.toast.error(err.error?.message || 'Error al registrar'),
        });
    }

    registrarMovimientoInterno() {
        if (this.movimientoForm.invalid) return;
        const { productoId, origen, destino, cantidad, motivo } = this.movimientoForm.value;
        this.inventarioService.registrarMovimientoInterno(productoId, origen, destino, cantidad, motivo).subscribe({
            next: () => {
                this.toast.exito('Movimiento registrado');
                this.movimientoForm.reset({ origen: 'principal', destino: 'averias', cantidad: 1 });
                this.cargarExistencias();
                this.cargarMovimientosInternos();
            },
            error: (err) => this.toast.error(err.error?.message || 'Error al registrar'),
        });
    }

    verDetalle(existencia: Existencia) {
        this.inventarioService.getKardex(existencia.id).subscribe(data => {
            this.kardexDetalle.set(data);
            this.construirGrafica(data);
        });
    }

    cerrarDetalle() {
        this.kardexDetalle.set(null);
    }

    construirGrafica(detalle: KardexDetalle) {
        const movimientos = detalle.movimientos;
        if (movimientos.length === 0) {
            this.chartOptions = {};
            return;
        }

        const categoriasPrincipal = movimientos.map(m => new Date(m.fecha).getTime());
        const dataPrincipal = movimientos.map(m => m.stockPrincipalDespues);
        const dataAverias = movimientos.map(m => m.stockAveriasDespues);

        this.chartOptions = {
            series: [
                { name: 'Principal', data: dataPrincipal },
                { name: 'Averías', data: dataAverias },
            ],
            chart: {
                type: 'area',
                height: 260,
                toolbar: { show: false },
                animations: { enabled: true },
            },
            colors: ['#C91B7E', '#FF9800'],
            fill: {
                type: 'gradient',
                gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 },
            },
            stroke: { curve: 'stepline', width: 2 },
            xaxis: {
                categories: categoriasPrincipal,
                type: 'datetime',
                labels: { datetimeFormatter: { day: 'dd MMM' } },
            },
            yaxis: { title: { text: 'Unidades' }, min: 0 },
            tooltip: { x: { format: 'dd MMM yyyy HH:mm' } },
            legend: { position: 'top' },
            grid: { borderColor: '#f0d0e0' },
        };
    }

    getImagenUrl(imagen: string): string {
        return `${environment.apiUrl}/uploads/${imagen}`;
    }

    getNombreProducto(id: number): string {
        return this.productos().find(p => p.id === id)?.nombre ?? `#${id}`;
    }
}
