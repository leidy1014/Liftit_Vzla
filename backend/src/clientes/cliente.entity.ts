import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('clientes')
export class Cliente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ nullable: true })
    telefono: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    documento: string;

    @Column({ default: true })
    activo: boolean;
}
