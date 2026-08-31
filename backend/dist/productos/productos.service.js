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
exports.ProductosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const producto_entity_1 = require("./producto.entity");
const categoria_entity_1 = require("../categorias/categoria.entity");
let ProductosService = class ProductosService {
    productoRepository;
    categoriaRepository;
    constructor(productoRepository, categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }
    generarSlug(nombre) {
        return nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
    findAll() {
        return this.productoRepository.find({
            relations: { categorias: true },
            order: { visitas: 'DESC', id: 'ASC' },
        });
    }
    async findBySlug(slug) {
        const numId = parseInt(slug, 10);
        if (!isNaN(numId) && String(numId) === slug) {
            return this.findOne(numId);
        }
        const producto = await this.productoRepository.findOne({
            where: { slug },
            relations: { categorias: true },
        });
        if (!producto)
            throw new common_1.NotFoundException(`Producto no encontrado`);
        return producto;
    }
    registrarVisita(id) {
        this.productoRepository.increment({ id }, 'visitas', 1);
    }
    async reordenar(ids) {
        await Promise.all(ids.map((id, index) => this.productoRepository.update(id, { orden: index })));
    }
    async findOne(id) {
        const producto = await this.productoRepository.findOne({
            where: { id },
            relations: { categorias: true },
        });
        if (!producto)
            throw new common_1.NotFoundException(`Producto #${id} no encontrado`);
        return producto;
    }
    async create(dto) {
        const { categoriaIds, ...resto } = dto;
        const producto = this.productoRepository.create(resto);
        producto.slug = this.generarSlug(dto.nombre);
        producto.categorias = categoriaIds?.length
            ? await this.categoriaRepository.findBy({ id: (0, typeorm_2.In)(categoriaIds) })
            : [];
        return this.productoRepository.save(producto);
    }
    async update(id, dto) {
        const { categoriaIds, ...resto } = dto;
        const producto = await this.findOne(id);
        Object.assign(producto, resto);
        if (dto.nombre)
            producto.slug = this.generarSlug(dto.nombre);
        if (categoriaIds !== undefined) {
            producto.categorias = categoriaIds.length
                ? await this.categoriaRepository.findBy({ id: (0, typeorm_2.In)(categoriaIds) })
                : [];
        }
        await this.productoRepository.save(producto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.productoRepository.delete(id);
    }
    async agregarImagen(id, filename) {
        const producto = await this.findOne(id);
        const imagenes = Array.isArray(producto.imagenes) ? producto.imagenes : [];
        producto.imagenes = [...imagenes, filename];
        return this.productoRepository.save(producto);
    }
    async eliminarImagen(id, filename) {
        const producto = await this.findOne(id);
        producto.imagenes = (producto.imagenes ?? []).filter(img => img !== filename);
        return this.productoRepository.save(producto);
    }
};
exports.ProductosService = ProductosService;
exports.ProductosService = ProductosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(1, (0, typeorm_1.InjectRepository)(categoria_entity_1.Categoria)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductosService);
//# sourceMappingURL=productos.service.js.map