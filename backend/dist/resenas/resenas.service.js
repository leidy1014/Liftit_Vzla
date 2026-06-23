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
exports.ResenasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const resena_entity_1 = require("./resena.entity");
let ResenasService = class ResenasService {
    resenaRepo;
    constructor(resenaRepo) {
        this.resenaRepo = resenaRepo;
    }
    getByProducto(productoId) {
        return this.resenaRepo.find({
            where: { producto: { id: productoId } },
            relations: { usuario: true },
            order: { creadoEn: 'DESC' },
        });
    }
    async getResumen() {
        const rows = await this.resenaRepo.query(`
      SELECT producto_id AS "productoId",
             ROUND(AVG(puntuacion)::numeric, 1)::float AS promedio,
             COUNT(id)::int AS total
      FROM resenas
      GROUP BY producto_id
    `);
        return rows;
    }
    async crear(usuarioId, productoId, puntuacion, comentario) {
        const existe = await this.resenaRepo.findOne({
            where: { producto: { id: productoId }, usuario: { id: usuarioId } },
        });
        if (existe)
            throw new common_1.ConflictException('Ya dejaste una reseña para este producto');
        const resena = this.resenaRepo.create({
            puntuacion,
            comentario,
            producto: { id: productoId },
            usuario: { id: usuarioId },
        });
        return this.resenaRepo.save(resena);
    }
};
exports.ResenasService = ResenasService;
exports.ResenasService = ResenasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resena_entity_1.Resena)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ResenasService);
//# sourceMappingURL=resenas.service.js.map