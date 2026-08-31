import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { Categoria } from "../categorias/categoria.entity";
import { CreateProductoDto } from './dto/create-producto.dto';
export declare class ProductosService {
    private readonly productoRepository;
    private readonly categoriaRepository;
    constructor(productoRepository: Repository<Producto>, categoriaRepository: Repository<Categoria>);
    private generarSlug;
    findAll(): Promise<Producto[]>;
    findBySlug(slug: string): Promise<Producto>;
    registrarVisita(id: number): void;
    reordenar(ids: number[]): Promise<void>;
    findOne(id: number): Promise<Producto>;
    create(dto: CreateProductoDto): Promise<Producto>;
    update(id: number, dto: Partial<CreateProductoDto>): Promise<Producto>;
    remove(id: number): Promise<void>;
    agregarImagen(id: number, filename: string): Promise<Producto>;
    eliminarImagen(id: number, filename: string): Promise<Producto>;
}
