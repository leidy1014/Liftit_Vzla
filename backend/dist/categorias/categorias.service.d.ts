import { Categoria } from './categoria.entity';
import { Repository } from 'typeorm';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
export declare class CategoriasService {
    private readonly categoriaRepository;
    constructor(categoriaRepository: Repository<Categoria>);
    findAll(): Promise<Categoria[]>;
    findOne(id: number): Promise<Categoria | null>;
    create(dto: CreateCategoriaDto): Promise<Categoria>;
    update(id: number, dto: Partial<CreateCategoriaDto>): Promise<Categoria>;
    remove(id: number): Promise<void>;
}
