"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarritoModule = void 0;
const common_1 = require("@nestjs/common");
const carrito_service_1 = require("./carrito.service");
const carrito_controller_1 = require("./carrito.controller");
const typeorm_1 = require("@nestjs/typeorm");
const carrito_item_entity_1 = require("./carrito-item.entity");
const producto_entity_1 = require("../productos/producto.entity");
const usuario_entity_1 = require("../usuarios/usuario.entity");
let CarritoModule = class CarritoModule {
};
exports.CarritoModule = CarritoModule;
exports.CarritoModule = CarritoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([carrito_item_entity_1.CarritoItem, producto_entity_1.Producto, usuario_entity_1.Usuario]),
        ],
        providers: [carrito_service_1.CarritoService],
        controllers: [carrito_controller_1.CarritoController],
    })
], CarritoModule);
//# sourceMappingURL=carrito.module.js.map