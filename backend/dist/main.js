"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const fs_1 = require("fs");
const typeorm_1 = require("@nestjs/typeorm");
const app_module_1 = require("./app.module");
const producto_entity_1 = require("./productos/producto.entity");
const CRAWLERS = /facebookexternalhit|WhatsApp|Twitterbot|TelegramBot|LinkedInBot|Slackbot|Discordbot|vkShare|W3C_Validator/i;
const UPLOADS_URL = 'https://qpytbgwvwjrcipjsdrms.supabase.co/storage/v1/object/public/imagenes';
const SITE_URL = 'https://liftitfitnesscol.com';
function esc(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
async function bootstrap() {
    (0, fs_1.mkdirSync)((0, path_1.join)(__dirname, '..', 'uploads'), { recursive: true });
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({ origin: true, credentials: true });
    app.setGlobalPrefix('api');
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    const server = app.getHttpAdapter().getInstance();
    const productoRepo = app.get((0, typeorm_1.getRepositoryToken)(producto_entity_1.Producto));
    server.get('/productos/:id', async (req, res, next) => {
        const ua = req.headers['user-agent'] || '';
        if (!CRAWLERS.test(ua))
            return next();
        const id = parseInt(req.params.id, 10);
        if (isNaN(id))
            return next();
        try {
            const producto = await productoRepo.findOne({ where: { id } });
            if (!producto)
                return next();
            const titulo = esc(`${producto.nombre} | Liftit Fitness`);
            const descripcion = esc(producto.descripcion
                ? producto.descripcion.slice(0, 155).trimEnd() + '...'
                : `${producto.nombre} — Equipamiento deportivo profesional en Colombia.`);
            const imagen = producto.imagen
                ? `${UPLOADS_URL}/${producto.imagen}`
                : `${SITE_URL}/hero-banner.jpg.png`;
            const url = `${SITE_URL}/productos/${id}`;
            const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${titulo}</title>
  <meta name="description" content="${descripcion}">
  <meta property="og:type" content="product">
  <meta property="og:title" content="${titulo}">
  <meta property="og:description" content="${descripcion}">
  <meta property="og:image" content="${imagen}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Liftit Fitness Colombia">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${titulo}">
  <meta name="twitter:description" content="${descripcion}">
  <meta name="twitter:image" content="${imagen}">
</head>
<body>
  <a href="${url}">${titulo}</a>
</body>
</html>`;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.send(html);
        }
        catch {
            return next();
        }
    });
    server.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
        res.sendFile((0, path_1.join)(__dirname, '..', 'public', 'index.html'));
    });
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map