import { ClientesService } from './clientes.service';
export declare class ClientesController {
    private readonly clientesService;
    constructor(clientesService: ClientesService);
    getAll(): Promise<import("./cliente.entity").Cliente[]>;
    crear(nombre: string, telefono: string, email?: string, documento?: string): Promise<import("./cliente.entity").Cliente>;
    actualizar(id: number, nombre: string, telefono: string, email?: string, documento?: string): Promise<import("./cliente.entity").Cliente>;
    eliminar(id: number): Promise<void>;
    borrarPermanente(id: number): Promise<void>;
}
