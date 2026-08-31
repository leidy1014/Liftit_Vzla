"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const productos_module_1 = require("./productos/productos.module");
const usuarios_module_1 = require("./usuarios/usuarios.module");
const auth_module_1 = require("./auth/auth.module");
const categorias_module_1 = require("./categorias/categorias.module");
const carrito_module_1 = require("./carrito/carrito.module");
const clientes_module_1 = require("./clientes/clientes.module");
const resenas_module_1 = require("./resenas/resenas.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.development', '.env'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => {
                    const host = config.get('DB_HOST') ?? 'localhost';
                    const isLocal = host === 'localhost' || host === '127.0.0.1';
                    return {
                        type: 'postgres',
                        host,
                        port: config.get('DB_PORT'),
                        username: config.get('DB_USER'),
                        password: config.get('DB_PASSWORD'),
                        database: config.get('DB_NAME'),
                        ssl: isLocal ? false : { rejectUnauthorized: false },
                        autoLoadEntities: true,
                        synchronize: true,
                    };
                },
                inject: [config_1.ConfigService],
            }),
            productos_module_1.ProductosModule,
            usuarios_module_1.UsuariosModule,
            auth_module_1.AuthModule,
            categorias_module_1.CategoriasModule,
            carrito_module_1.CarritoModule,
            clientes_module_1.ClientesModule,
            resenas_module_1.ResenasModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map