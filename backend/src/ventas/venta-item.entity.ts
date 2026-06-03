import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Venta } from './venta.entity';
import { Producto } from '../productos/producto.entity';

@Entity('venta_items')
export class VentaItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Venta, venta => venta.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venta_id' })
    venta: Venta;

    @ManyToOne(() => Producto, { nullable: false })
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;

    @Column()
    cantidad: number;

    @Column('decimal', { precision: 10, scale: 2 })
    precioUnitario: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    costoUnitario: number;

    @Column('decimal', { precision: 12, scale: 2 })
    subtotal: number;
}
