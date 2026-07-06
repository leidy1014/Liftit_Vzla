import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import { Producto } from './productos/producto.entity';

const CRAWLERS = /facebookexternalhit|WhatsApp|Twitterbot|TelegramBot|LinkedInBot|Slackbot|Discordbot|vkShare|W3C_Validator/i;
const UPLOADS_URL = 'https://qpytbgwvwjrcipjsdrms.supabase.co/storage/v1/object/public/imagenes';
const SITE_URL = 'https://liftitfitnesscol.com';

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function bootstrap() {
  mkdirSync(join(__dirname, '..', 'uploads'), { recursive: true });
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('api');
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const server = app.getHttpAdapter().getInstance();
  const productoRepo = app.get(getRepositoryToken(Producto));

  // Middleware OG para crawlers sociales (WhatsApp, Facebook, etc.)
  // Debe ir ANTES del fallback SPA
  server.get('/productos/:id', async (req: any, res: any, next: any) => {
    const ua = req.headers['user-agent'] || '';
    if (!CRAWLERS.test(ua)) return next();

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next();

    try {
      const producto = await productoRepo.findOne({ where: { id } });
      if (!producto) return next();

      const titulo = esc(`${producto.nombre} | Liftit Fitness`);
      const descripcion = esc(
        producto.descripcion
          ? producto.descripcion.slice(0, 155).trimEnd() + '...'
          : `${producto.nombre} — Equipamiento deportivo profesional en Colombia.`,
      );
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
    } catch {
      return next();
    }
  });

  // SPA fallback: serve index.html for all non-API routes
  server.get(/^(?!\/api|\/uploads).*/, (_req: any, res: any) => {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
