import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const originesPermitidos = [
    'http://localhost:4200',
    process.env.FRONTEND_URL,
  ].filter((url): url is string => Boolean(url));

  app.enableCors({
    origin: originesPermitidos,
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
