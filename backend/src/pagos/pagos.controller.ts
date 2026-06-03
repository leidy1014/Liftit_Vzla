import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('pagos')
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin')
export class PagosController {
    constructor(private readonly pagosService: PagosService) {}

    @Get('metodo/:metodo')
    getPagosPorMetodo(
        @Param('metodo') metodo: string,
        @Query('desde') desde?: string,
        @Query('hasta') hasta?: string,
    ) {
        return this.pagosService.getPagosPorMetodo(metodo, desde, hasta);
    }

    @Get('resumen')
    getResumenCaja(
        @Query('desde') desde?: string,
        @Query('hasta') hasta?: string,
    ) {
        return this.pagosService.getResumenCaja(desde, hasta);
    }

    @Get('venta/:ventaId')
    getByVenta(@Param('ventaId', ParseIntPipe) ventaId: number) {
        return this.pagosService.getByVenta(ventaId);
    }

    @Post()
    registrar(
        @Body('ventaId') ventaId: number,
        @Body('monto') monto: number,
        @Body('metodo') metodo: string,
        @Body('notas') notas?: string,
    ) {
        return this.pagosService.registrar(ventaId, monto, metodo, notas);
    }

    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.pagosService.eliminar(id);
    }
}
