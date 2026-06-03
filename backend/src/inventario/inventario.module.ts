import { Module } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { Movimiento } from './movimiento.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from '../productos/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movimiento, Producto])],
  providers: [InventarioService],
  controllers: [InventarioController]
})
export class InventarioModule {}
