import { CarritoService } from './carrito.service';
export declare class CarritoController {
    private readonly carritoService;
    constructor(carritoService: CarritoService);
    getCarrito(req: any): Promise<import("./carrito-item.entity").CarritoItem[]>;
    agregarItem(req: any, body: {
        productoId: number;
        cantidad: number;
    }): Promise<import("typeorm").UpdateResult | import("./carrito-item.entity").CarritoItem>;
    actualizarItem(id: number, body: {
        cantidad: number;
    }): Promise<import("typeorm").UpdateResult>;
    eliminarItem(id: number): Promise<void>;
    checkout(req: any): Promise<{
        whatsappUrl: string;
        total: number;
        cantidadItems: number;
    }>;
}
