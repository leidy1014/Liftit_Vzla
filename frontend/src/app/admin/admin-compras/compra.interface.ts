export interface Proveedor {
    id: number;
    nombre: string;
    nit?: string;
    telefono?: string;
    email?: string;
    activo?: boolean;
}

export interface CompraItemProducto {
    id: number;
    nombre: string;
    imagen: string | null;
}

export interface CompraItem {
    id: number;
    producto: CompraItemProducto | null;
    cantidad: number;
    precioCompra: number;
    subtotal: number;
}

export interface Compra {
    id: number;
    numero: string;
    proveedor: Proveedor | null;
    estado: 'pedido' | 'recibido' | 'cancelado';
    total: number;
    fecha: string;
    facturaProveedor?: string;
    fechaVencimiento?: string;
    items?: CompraItem[];
}

export interface NuevaCompraDto {
    proveedorId: number;
    items: { productoId: number; cantidad: number; precioCompra: number }[];
    facturaProveedor?: string;
    fechaVencimiento?: string;
}

export interface ProveedorHistorial {
    proveedor: Proveedor;
    stats: {
        totalOrdenes: number;
        totalInvertido: number;
        ultimaCompra: string | null;
    };
    compras: Compra[];
}
