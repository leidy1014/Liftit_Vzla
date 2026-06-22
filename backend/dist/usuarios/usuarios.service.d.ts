import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
export declare class UsuariosService {
    private readonly usuarioRepository;
    constructor(usuarioRepository: Repository<Usuario>);
    findByEmail(email: string): Promise<Usuario | null>;
    create(data: Partial<Usuario>): Promise<Usuario>;
}
