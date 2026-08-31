import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
export declare class CategoriasController {
    private readonly categoriasService;
    constructor(categoriasService: CategoriasService);
    findAll(): Promise<import("./categoria.entity").Categoria[]>;
    findOne(id: number): Promise<import("./categoria.entity").Categoria | null>;
    create(dto: CreateCategoriaDto): Promise<import("./categoria.entity").Categoria>;
    update(id: number, dto: Partial<CreateCategoriaDto>): Promise<import("./categoria.entity").Categoria>;
    remove(id: number): Promise<void>;
}
