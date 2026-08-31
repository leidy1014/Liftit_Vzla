import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Cliente } from '../clientes/cliente.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async register(nombre: string, email: string, password: string) {
    const existe = await this.usuariosService.findByEmail(email);
    if (existe) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(password, 10);
    const usuario = await this.usuariosService.create({ nombre, email, password: hash });

    const cliente = this.clienteRepository.create({ nombre, email });
    await this.clienteRepository.save(cliente);

    return { mensaje: 'Usuario creado correctamente', id: usuario.id };
  }

  async login(email: string, password: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) throw new UnauthorizedException('Credenciales incorrectas');

    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre };
    return { access_token: this.jwtService.sign(payload) };
  }
}
