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
exports.ClientesController = void 0;
const common_1 = require("@nestjs/common");
const clientes_service_1 = require("./clientes.service");
const jwt_guard_1 = require("../auth/jwt.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ClientesController = class ClientesController {
    clientesService;
    constructor(clientesService) {
        this.clientesService = clientesService;
    }
    getAll() {
        return this.clientesService.getAll();
    }
    crear(nombre, telefono, email, documento) {
        return this.clientesService.crear(nombre, telefono, email, documento);
    }
    actualizar(id, nombre, telefono, email, documento) {
        return this.clientesService.actualizar(id, nombre, telefono, email, documento);
    }
    eliminar(id) {
        return this.clientesService.eliminar(id);
    }
    borrarPermanente(id) {
        return this.clientesService.borrarPermanente(id);
    }
};
exports.ClientesController = ClientesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ClientesController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('nombre')),
    __param(1, (0, common_1.Body)('telefono')),
    __param(2, (0, common_1.Body)('email')),
    __param(3, (0, common_1.Body)('documento')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ClientesController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('nombre')),
    __param(2, (0, common_1.Body)('telefono')),
    __param(3, (0, common_1.Body)('email')),
    __param(4, (0, common_1.Body)('documento')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ClientesController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ClientesController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Delete)(':id/permanente'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ClientesController.prototype, "borrarPermanente", null);
exports.ClientesController = ClientesController = __decorate([
    (0, common_1.Controller)('clientes'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [clientes_service_1.ClientesService])
], ClientesController);
//# sourceMappingURL=clientes.controller.js.map