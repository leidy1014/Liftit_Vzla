import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { Venta } from './venta.entity';
import { VentaItem } from './venta-item.entity';
import { Producto } from '../productos/producto.entity';
import { Movimiento } from '../inventario/movimiento.entity';
import { Cliente } from '../clientes/cliente.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Venta, VentaItem, Producto, Movimiento, Cliente])],
    providers: [VentasService],
    controllers: [VentasController],
    exports: [VentasService],
})
export class VentasModule {}
