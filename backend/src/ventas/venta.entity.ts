import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VentaItem } from './venta-item.entity';
import { Cliente } from '../clientes/cliente.entity';

@Entity('ventas')
export class Venta {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: true })
    numero: string;

    @Column()
    clienteNombre: string;

    @ManyToOne(() => Cliente, { nullable: true, eager: false })
    @JoinColumn({ name: 'cliente_id' })
    cliente: Cliente | null;

    @Column({ default: 'cotizacion' })
    estado: string;

    @Column({ default: 'admin' })
    origen: string; // 'admin' | 'ecommerce'

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    total: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    montoPagado: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    @OneToMany(() => VentaItem, item => item.venta, { cascade: true })
    items: VentaItem[];
}
