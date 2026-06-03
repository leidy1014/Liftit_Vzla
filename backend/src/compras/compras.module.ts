import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compra } from './compra.entity';
import { CompraItem } from './compra-item.entity';
import { Proveedor } from './proveedor.entity';
import { Producto } from '../productos/producto.entity';
import { Movimiento } from '../inventario/movimiento.entity';
import { ComprasService } from './compras.service';
import { ProveedoresService } from './proveedores.service';
import { ComprasController } from './compras.controller';
import { ProveedoresController } from './proveedores.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Compra, CompraItem, Proveedor, Producto, Movimiento])],
    providers: [ComprasService, ProveedoresService],
    controllers: [ComprasController, ProveedoresController],
})
export class ComprasModule {}
