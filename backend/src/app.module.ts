import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductosModule } from './productos/productos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { CategoriasModule } from './categorias/categorias.module';
import { CarritoModule } from './carrito/carrito.module';
import { ClientesModule } from './clientes/clientes.module';
import { ResenasModule } from './resenas/resenas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('DB_HOST') ?? 'localhost';
        const isLocal = host === 'localhost' || host === '127.0.0.1';
        return {
          type: 'postgres',
          host,
          port: config.get<number>('DB_PORT'),
          username: config.get('DB_USER'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
          ssl: isLocal ? false : { rejectUnauthorized: false },
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    ProductosModule,
    UsuariosModule,
    AuthModule,
    CategoriasModule,
    CarritoModule,
    ClientesModule,
    ResenasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
