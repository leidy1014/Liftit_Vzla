export interface Movimiento {
    id: number;
    tipo: 'recepcion' | 'movimiento_interno' | 'salida';
    cantidad: number;
    motivo: string;
    ubicacionOrigen: string;
    ubicacionDestino: string;
    stockPrincipalDespues: number;
    stockAveriasDespues: number;
    fecha: string;
    producto: {
        id: number;
        nombre: string;
        stock: number;
        stockAverias: number;
    };
}

export interface Existencia {
    id: number;
    nombre: string;
    referencia: string;
    marca: string;
    imagen?: string;
    categoria?: { id: number; nombre: string };
    costo: number;
    precio: number;
    stock: number;
    stockAverias: number;
    stockTotal: number;
    stockMinimo: number;
    valorTotal: number;
    margen: number | null;
}

export interface KardexDetalle {
    producto: {
        id: number;
        nombre: string;
        stock: number;
        stockAverias: number;
        costo: number;
        precio: number;
        stockMinimo: number;
    };
    movimientos: Movimiento[];
}
