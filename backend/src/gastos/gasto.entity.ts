import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('gastos')
export class Gasto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    descripcion: string;

    @Column('decimal', { precision: 12, scale: 2 })
    monto: number;

    @Column()
    categoria: string;

    @Column({ default: 'efectivo' })
    metodoPago: string;

    @Column({ type: 'date' })
    fecha: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;
}
