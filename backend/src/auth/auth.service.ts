import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async register(nombre: string, email: string, password: string) {
    const existe = await this.usuariosService.findByEmail(email);
    if (existe) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(password, 10);
    const usuario = await this.usuariosService.create({ nombre, email, password: hash });

    return { mensaje: 'Usuario creado correctamente', id: usuario.id };
  }

  async login(email: string, password: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) throw new UnauthorizedException('Credenciales incorrectas');

    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    return { access_token: this.jwtService.sign(payload) };
  }
}
