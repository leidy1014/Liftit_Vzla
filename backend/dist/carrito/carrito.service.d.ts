import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CarritoItem } from './carrito-item.entity';
import { Producto } from '../productos/producto.entity';
import { Usuario } from '../usuarios/usuario.entity';
export declare class CarritoService {
    private readonly carritoRepository;
    private readonly productoRepository;
    private readonly usuarioRepository;
    private readonly configService;
    constructor(carritoRepository: Repository<CarritoItem>, productoRepository: Repository<Producto>, usuarioRepository: Repository<Usuario>, configService: ConfigService);
    getCarrito(usuarioId: number): Promise<CarritoItem[]>;
    actualizarItem(id: number, cantidad: number): Promise<import("typeorm").UpdateResult>;
    agregarItem(usuarioId: number, productoId: number, cantidad: number): Promise<CarritoItem | import("typeorm").UpdateResult>;
    eliminarItem(id: number): Promise<void>;
    checkout(usuarioId: number): Promise<{
        whatsappUrl: string;
        total: number;
        cantidadItems: number;
    }>;
}
