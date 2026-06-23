import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Cliente } from '../clientes/cliente.entity';
export declare class AuthService {
    private readonly usuariosService;
    private readonly jwtService;
    private readonly clienteRepository;
    constructor(usuariosService: UsuariosService, jwtService: JwtService, clienteRepository: Repository<Cliente>);
    register(nombre: string, email: string, password: string): Promise<{
        mensaje: string;
        id: number;
    }>;
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
}
