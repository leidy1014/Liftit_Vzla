import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { Categoria } from 'src/categorias/categoria.entity';
import { CreateProductoDto } from './dto/create-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  findAll(): Promise<Producto[]> {
    return this.productoRepository.find({
      relations: { categorias: true },
      order: { orden: 'ASC', id: 'ASC' },
    });
  }

  async reordenar(ids: number[]): Promise<void> {
    await Promise.all(
      ids.map((id, index) => this.productoRepository.update(id, { orden: index }))
    );
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: { categorias: true },
    });
    if (!producto) throw new NotFoundException(`Producto #${id} no encontrado`);
    return producto;
  }

  async create(dto: CreateProductoDto): Promise<Producto> {
    const { categoriaIds, ...resto } = dto;
    const producto = this.productoRepository.create(resto);
    producto.categorias = categoriaIds?.length
      ? await this.categoriaRepository.findBy({ id: In(categoriaIds) })
      : [];
    return this.productoRepository.save(producto);
  }

  async update(id: number, dto: Partial<CreateProductoDto>): Promise<Producto> {
    const { categoriaIds, ...resto } = dto;
    const producto = await this.findOne(id);
    Object.assign(producto, resto);
    if (categoriaIds !== undefined) {
      producto.categorias = categoriaIds.length
        ? await this.categoriaRepository.findBy({ id: In(categoriaIds) })
        : [];
    }
    await this.productoRepository.save(producto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.productoRepository.delete(id);
  }

  async agregarImagen(id: number, filename: string): Promise<Producto> {
    const producto = await this.findOne(id);
    const imagenes = Array.isArray(producto.imagenes) ? producto.imagenes : [];
    producto.imagenes = [...imagenes, filename];
    return this.productoRepository.save(producto);
  }

  async eliminarImagen(id: number, filename: string): Promise<Producto> {
    const producto = await this.findOne(id);
    producto.imagenes = (producto.imagenes ?? []).filter(img => img !== filename);
    return this.productoRepository.save(producto);
  }
}
