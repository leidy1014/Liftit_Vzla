import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
export declare class AuthService {
    private readonly usuariosService;
    private readonly jwtService;
    constructor(usuariosService: UsuariosService, jwtService: JwtService);
    register(nombre: string, email: string, password: string): Promise<{
        mensaje: string;
        id: number;
    }>;
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
}
