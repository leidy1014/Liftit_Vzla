import { Categoria } from '../categorias/categoria.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column({ default: 0 })
  orden: number;

  @Column({ default: 0 })
  visitas: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precioDolar: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  precioBolivares: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 0 })
  stockAverias: number;

  @Column({ default: true })
  activo: boolean;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  costo: number;

  @Column({ nullable: true })
  referencia: string;

  @Column({ nullable: true })
  marca: string;

  @Column({ nullable: true })
  codigoBarras: string;

  @Column({ default: 5 })
  stockMinimo: number;

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  imagen: string;

  @Column('simple-json', { nullable: true, default: '[]' })
  imagenes: string[];

  @ManyToMany(() => Categoria, { eager: false })
  @JoinTable({ name: 'producto_categorias' })
  categorias: Categoria[];

}
