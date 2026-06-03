import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Compra } from './compra.entity';
import { Producto } from '../productos/producto.entity';

@Entity('compra_items')
export class CompraItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Compra, compra => compra.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'compra_id' })
    compra: Compra;

    @ManyToOne(() => Producto, { nullable: false })
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;

    @Column()
    cantidad: number;

    @Column('decimal', { precision: 10, scale: 2 })
    precioCompra: number;

    @Column('decimal', { precision: 12, scale: 2 })
    subtotal: number;
}
