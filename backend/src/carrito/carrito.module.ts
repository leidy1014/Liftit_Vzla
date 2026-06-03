import { Module } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoItem } from './carrito-item.entity';
import { Producto } from '../productos/producto.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { VentasModule } from '../ventas/ventas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarritoItem, Producto, Usuario]),
    VentasModule,
  ],
  providers: [CarritoService],
  controllers: [CarritoController],
})
export class CarritoModule {}
