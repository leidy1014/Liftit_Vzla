import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
export declare class ProductosService {
    private readonly productoRepository;
    constructor(productoRepository: Repository<Producto>);
    findAll(): Promise<Producto[]>;
    reordenar(ids: number[]): Promise<void>;
    findOne(id: number): Promise<Producto>;
    create(dto: CreateProductoDto): Promise<Producto>;
    update(id: number, dto: Partial<CreateProductoDto>): Promise<Producto>;
    remove(id: number): Promise<void>;
    agregarImagen(id: number, filename: string): Promise<Producto>;
    eliminarImagen(id: number, filename: string): Promise<Producto>;
}
