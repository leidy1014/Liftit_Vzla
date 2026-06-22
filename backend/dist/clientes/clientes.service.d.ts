import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
export declare class ClientesService {
    private readonly clienteRepo;
    constructor(clienteRepo: Repository<Cliente>);
    getAll(): Promise<Cliente[]>;
    crear(nombre: string, telefono: string, email?: string, documento?: string): Promise<Cliente>;
    actualizar(id: number, nombre: string, telefono: string, email?: string, documento?: string): Promise<Cliente>;
    eliminar(id: number): Promise<void>;
    borrarPermanente(id: number): Promise<void>;
}
