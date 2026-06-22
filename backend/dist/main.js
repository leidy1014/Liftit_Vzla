"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({ origin: true, credentials: true });
    app.setGlobalPrefix('api');
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), { prefix: '/api/uploads/' });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    const server = app.getHttpAdapter().getInstance();
    server.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
        res.sendFile((0, path_1.join)(__dirname, '..', 'public', 'index.html'));
    });
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map