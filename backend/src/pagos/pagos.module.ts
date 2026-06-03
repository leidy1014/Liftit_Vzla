import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { Pago } from './pago.entity';
import { Venta } from '../ventas/venta.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Pago, Venta])],
    providers: [PagosService],
    controllers: [PagosController],
})
export class PagosModule {}
