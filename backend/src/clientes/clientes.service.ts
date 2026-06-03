import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity';

@Injectable()
export class ClientesService {
    constructor(
        @InjectRepository(Cliente)
        private readonly clienteRepo: Repository<Cliente>,
    ) {}

    getAll() {
        return this.clienteRepo.find({ where: { activo: true }, order: { nombre: 'ASC' } });
    }

    async crear(nombre: string, telefono: string, email?: string, documento?: string) {
        if (!nombre?.trim()) throw new BadRequestException('El nombre del cliente es obligatorio');
        if (!telefono?.trim()) throw new BadRequestException('El teléfono del cliente es obligatorio');
        const cliente = this.clienteRepo.create({ nombre: nombre.trim(), telefono: telefono.trim(), email, documento });
        return this.clienteRepo.save(cliente);
    }

    async actualizar(id: number, nombre: string, telefono: string, email?: string, documento?: string) {
        const cliente = await this.clienteRepo.findOne({ where: { id } });
        if (!cliente) throw new NotFoundException('Cliente no encontrado');
        if (nombre?.trim()) cliente.nombre = nombre.trim();
        if (telefono?.trim()) cliente.telefono = telefono.trim();
        cliente.email = email ?? cliente.email;
        cliente.documento = documento ?? cliente.documento;
        return this.clienteRepo.save(cliente);
    }

    async eliminar(id: number) {
        const cliente = await this.clienteRepo.findOne({ where: { id } });
        if (!cliente) throw new NotFoundException('Cliente no encontrado');
        cliente.activo = false;
        await this.clienteRepo.save(cliente);
    }

    async borrarPermanente(id: number) {
        const cliente = await this.clienteRepo.findOne({ where: { id } });
        if (!cliente) throw new NotFoundException('Cliente no encontrado');
        await this.clienteRepo.remove(cliente);
    }
}
