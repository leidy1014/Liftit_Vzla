import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        nombre: string;
        email: string;
        password: string;
    }): Promise<{
        mensaje: string;
        id: number;
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
    }>;
}
