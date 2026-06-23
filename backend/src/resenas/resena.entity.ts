import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Producto } from '../productos/producto.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('resenas')
export class Resena {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  puntuacion: number;

  @Column('text', { nullable: true })
  comentario: string;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Producto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
