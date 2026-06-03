import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn  } from 'typeorm';
import { Producto } from '../productos/producto.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('carrito_items')
export class CarritoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  cantidad: number;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}