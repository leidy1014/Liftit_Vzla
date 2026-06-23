import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
export declare class ProductosController {
    private readonly productosService;
    constructor(productosService: ProductosService);
    findAll(): Promise<import("./producto.entity").Producto[]>;
    findOne(id: number): Promise<import("./producto.entity").Producto>;
    uploadImagen(file: Express.Multer.File): Promise<{
        filename: string;
    }>;
    create(dto: CreateProductoDto): Promise<import("./producto.entity").Producto>;
    update(id: number, dto: Partial<CreateProductoDto>): Promise<import("./producto.entity").Producto>;
    remove(id: number): Promise<void>;
    agregarImagen(id: number, file: Express.Multer.File): Promise<import("./producto.entity").Producto>;
    eliminarImagen(id: number, filename: string): Promise<import("./producto.entity").Producto>;
}
