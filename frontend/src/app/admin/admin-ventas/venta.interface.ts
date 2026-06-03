export interface VentaItemProducto {
    id: number;
    nombre: string;
    precio: number;
    imagen: string | null;
}

export interface VentaItem {
    id: number;
    producto: VentaItemProducto | null;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface ClienteVenta {
    id: number;
    nombre: string;
    telefono: string;
    email: string | null;
    documento: string | null;
}

export interface Venta {
    id: number;
    numero: string;
    clienteNombre: string;
    cliente?: ClienteVenta | null;
    estado: 'cotizacion' | 'confirmada' | 'cancelada' | 'anulada';
    origen: 'admin' | 'ecommerce';
    total: number;
    montoPagado: number;
    saldo: number;
    estadoPago: 'pendiente' | 'abonado' | 'pagado';
    fecha: string;
    items?: VentaItem[];
}

export interface Pago {
    id: number;
    monto: number;
    metodo: 'efectivo' | 'nequi' | 'daviplata';
    fecha: string;
    notas?: string;
}

export interface NuevaVentaDto {
    clienteNombre: string;
    clienteId?: number;
    items: { productoId: number; cantidad: number; precioUnitario: number }[];
}
