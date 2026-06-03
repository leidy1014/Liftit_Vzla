import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from '../productos/producto.entity';

@Entity('movimientos_inventario')
export class Movimiento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tipo: 'recepcion' | 'movimiento_interno' | 'salida';

    @Column()
    cantidad: number;

    @Column({ nullable: true })
    motivo: string;

    @Column({ nullable: true })
    ubicacionOrigen: string;

    @Column({ nullable: true })
    ubicacionDestino: string;

    @Column({ default: 0 })
    stockPrincipalDespues: number;

    @Column({ default: 0 })
    stockAveriasDespues: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    @ManyToOne(() => Producto, { nullable: false })
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;
}
