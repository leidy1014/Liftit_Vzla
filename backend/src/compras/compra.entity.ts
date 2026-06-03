import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Proveedor } from './proveedor.entity';
import { CompraItem } from './compra-item.entity';

@Entity('compras')
export class Compra {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: true })
    numero: string;

    @ManyToOne(() => Proveedor, { nullable: false })
    @JoinColumn({ name: 'proveedor_id' })
    proveedor: Proveedor;

    @Column({ default: 'pedido' })
    estado: string;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    total: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    @Column({ nullable: true })
    facturaProveedor: string;

    @Column({ type: 'date', nullable: true })
    fechaVencimiento: string;

    @OneToMany(() => CompraItem, item => item.compra, { cascade: true })
    items: CompraItem[];
}
