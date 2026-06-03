export interface CarritoItem {
    id: number;
    cantidad: number;
    producto: {
        id: number;
        nombre: string;
        precio: number;
        stock: number;
        imagen?: string | null;
    }
}