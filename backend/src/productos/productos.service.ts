import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Categoria } from 'src/categorias/categoria.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  findAll(): Promise<Producto[]> {
    return this.productoRepository.find({ relations: { categoria: true } });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({ 
      where: { id }, 
      relations: { categoria: true } 
    });
    if (!producto) throw new NotFoundException(`Producto #${id} no encontrado`);
    return producto;
  }

  async create(dto: CreateProductoDto): Promise<Producto> {
    const { categoriaId, ...resto } = dto;
    const producto = this.productoRepository.create(resto);
    if (categoriaId) {
      producto.categoria = { id: categoriaId } as Categoria;
    }
    return this.productoRepository.save(producto);
  }


  async update(id: number, dto: Partial<CreateProductoDto>): Promise<Producto> {
    const { categoriaId, ...resto } = dto;
    const producto = await this.findOne(id);
    Object.assign(producto, resto);
    if (categoriaId) {
      producto.categoria = { id: categoriaId } as Categoria;
    }
    await this.productoRepository.save(producto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.productoRepository.delete(id);
  }
}
