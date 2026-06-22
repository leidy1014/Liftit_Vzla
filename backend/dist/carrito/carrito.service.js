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
exports.CarritoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const carrito_item_entity_1 = require("./carrito-item.entity");
const producto_entity_1 = require("../productos/producto.entity");
const usuario_entity_1 = require("../usuarios/usuario.entity");
let CarritoService = class CarritoService {
    carritoRepository;
    productoRepository;
    usuarioRepository;
    configService;
    constructor(carritoRepository, productoRepository, usuarioRepository, configService) {
        this.carritoRepository = carritoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.configService = configService;
    }
    getCarrito(usuarioId) {
        return this.carritoRepository.find({
            where: { usuario: { id: usuarioId } },
            relations: { producto: true },
        });
    }
    async actualizarItem(id, cantidad) {
        const item = await this.carritoRepository.findOne({
            where: { id },
            relations: { producto: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Item no encontrado en el carrito');
        if (cantidad > item.producto.stock) {
            throw new common_1.BadRequestException(`Solo hay ${item.producto.stock} unidades disponibles de "${item.producto.nombre}"`);
        }
        return this.carritoRepository.update(id, { cantidad });
    }
    async agregarItem(usuarioId, productoId, cantidad) {
        const producto = await this.productoRepository.findOne({ where: { id: productoId } });
        if (!producto)
            throw new common_1.NotFoundException('Producto no encontrado');
        if (producto.stock === 0) {
            throw new common_1.BadRequestException(`"${producto.nombre}" está agotado`);
        }
        const itemExistente = await this.carritoRepository.findOne({
            where: { usuario: { id: usuarioId }, producto: { id: productoId } },
        });
        const cantidadTotal = (itemExistente?.cantidad ?? 0) + cantidad;
        if (cantidadTotal > producto.stock) {
            throw new common_1.BadRequestException(`Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}"`);
        }
        if (itemExistente) {
            return this.actualizarItem(itemExistente.id, cantidadTotal);
        }
        const newItem = this.carritoRepository.create({
            usuario: { id: usuarioId },
            producto: { id: productoId },
            cantidad,
        });
        return this.carritoRepository.save(newItem);
    }
    async eliminarItem(id) {
        await this.carritoRepository.delete(id);
    }
    async checkout(usuarioId) {
        const items = await this.carritoRepository.find({
            where: { usuario: { id: usuarioId } },
            relations: { producto: true },
        });
        if (!items.length)
            throw new common_1.BadRequestException('El carrito está vacío');
        for (const item of items) {
            if (item.producto.stock < item.cantidad) {
                throw new common_1.BadRequestException(`Stock insuficiente para "${item.producto.nombre}". Disponible: ${item.producto.stock}, solicitado: ${item.cantidad}`);
            }
        }
        const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
        const clienteNombre = usuario?.nombre ?? `Cliente #${usuarioId}`;
        const total = items.reduce((sum, item) => sum + Number(item.producto.precio) * item.cantidad, 0);
        const lineas = items.map(item => `- ${item.producto.nombre} x${item.cantidad} ($${Number(item.producto.precio).toLocaleString('es-CO')})`);
        const mensaje = `Hola! Soy ${clienteNombre} y quiero hacer el siguiente pedido:\n\n` +
            lineas.join('\n') +
            `\n\nTotal: $${total.toLocaleString('es-CO')}`;
        const numero = this.configService.get('WHATSAPP_NUMBER');
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
        await this.carritoRepository.delete({ usuario: { id: usuarioId } });
        return { whatsappUrl: url, total, cantidadItems: items.length };
    }
};
exports.CarritoService = CarritoService;
exports.CarritoService = CarritoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(carrito_item_entity_1.CarritoItem)),
    __param(1, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(2, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], CarritoService);
//# sourceMappingURL=carrito.service.js.map