import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './proveedor.entity';

@Injectable()
export class ProveedoresService {
    constructor(
        @InjectRepository(Proveedor)
        private readonly proveedorRepo: Repository<Proveedor>,
    ) {}

    getAll() {
        return this.proveedorRepo.find({ where: { activo: true }, order: { nombre: 'ASC' } });
    }

    async crear(nombre: string, nit?: string, telefono?: string, email?: string) {
        if (!nombre?.trim()) throw new BadRequestException('El nombre del proveedor es obligatorio');
        const proveedor = this.proveedorRepo.create({ nombre, nit, telefono, email });
        return this.proveedorRepo.save(proveedor);
    }

    async actualizar(id: number, nombre: string, nit?: string, telefono?: string, email?: string) {
        const proveedor = await this.proveedorRepo.findOne({ where: { id } });
        if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
        if (nombre) proveedor.nombre = nombre;
        proveedor.nit = nit ?? proveedor.nit;
        proveedor.telefono = telefono ?? proveedor.telefono;
        proveedor.email = email ?? proveedor.email;
        return this.proveedorRepo.save(proveedor);
    }

    async eliminar(id: number) {
        const proveedor = await this.proveedorRepo.findOne({ where: { id } });
        if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
        proveedor.activo = false;
        await this.proveedorRepo.save(proveedor);
    }

    async borrarPermanente(id: number) {
        const proveedor = await this.proveedorRepo.findOne({ where: { id } });
        if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
        await this.proveedorRepo.remove(proveedor);
    }
}
