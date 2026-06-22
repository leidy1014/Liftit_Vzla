"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cliente_entity_1 = require("./cliente.entity");
let ClientesService = class ClientesService {
    clienteRepo;
    constructor(clienteRepo) {
        this.clienteRepo = clienteRepo;
    }
    getAll() {
        return this.clienteRepo.find({ where: { activo: true }, order: { nombre: 'ASC' } });
    }
    async crear(nombre, telefono, email, documento) {
        if (!nombre?.trim())
            throw new common_1.BadRequestException('El nombre del cliente es obligatorio');
        if (!telefono?.trim())
            throw new common_1.BadRequestException('El teléfono del cliente es obligatorio');
        const cliente = this.clienteRepo.create({ nombre: nombre.trim(), telefono: telefono.trim(), email, documento });
        return this.clienteRepo.save(cliente);
    }
    async actualizar(id, nombre, telefono, email, documento) {
        const cliente = await this.clienteRepo.findOne({ where: { id } });
        if (!cliente)
            throw new common_1.NotFoundException('Cliente no encontrado');
        if (nombre?.trim())
            cliente.nombre = nombre.trim();
        if (telefono?.trim())
            cliente.telefono = telefono.trim();
        cliente.email = email ?? cliente.email;
        cliente.documento = documento ?? cliente.documento;
        return this.clienteRepo.save(cliente);
    }
    async eliminar(id) {
        const cliente = await this.clienteRepo.findOne({ where: { id } });
        if (!cliente)
            throw new common_1.NotFoundException('Cliente no encontrado');
        cliente.activo = false;
        await this.clienteRepo.save(cliente);
    }
    async borrarPermanente(id) {
        const cliente = await this.clienteRepo.findOne({ where: { id } });
        if (!cliente)
            throw new common_1.NotFoundException('Cliente no encontrado');
        await this.clienteRepo.remove(cliente);
    }
};
exports.ClientesService = ClientesService;
exports.ClientesService = ClientesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cliente_entity_1.Cliente)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClientesService);
//# sourceMappingURL=clientes.service.js.map