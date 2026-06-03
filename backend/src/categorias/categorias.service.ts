import { Injectable } from '@nestjs/common';
import { Categoria } from './categoria.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoriaDto } from './dto/create-categoria.dto';


@Injectable()
export class CategoriasService {
    constructor(
        @InjectRepository(Categoria)
            private readonly categoriaRepository: Repository<Categoria>,
        ) { }

    findAll(): Promise<Categoria[]> {
        return this.categoriaRepository.find();
    }

    findOne(id: number): Promise<Categoria | null> {
        return this.categoriaRepository.findOneBy({ id });
    }

    async create(dto: CreateCategoriaDto): Promise<Categoria> {
        const categoria = this.categoriaRepository.create(dto);
        return this.categoriaRepository.save(categoria) as Promise<Categoria>;
    }

    async remove(id: number): Promise<void> {
        await this.findOne(id);
        await this.categoriaRepository.delete(id);
    }
}
