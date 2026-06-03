import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Venta } from '../ventas/venta.entity';

@Entity('pagos')
export class Pago {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Venta, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venta_id' })
    venta: Venta;

    @Column('decimal', { precision: 12, scale: 2 })
    monto: number;

    @Column()
    metodo: string; // efectivo | nequi | daviplata

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    @Column({ nullable: true })
    notas: string;
}
