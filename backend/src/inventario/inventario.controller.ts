import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { Roles } from '../auth/roles.decorator';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('inventario')
export class InventarioController {
    constructor(private readonly inventarioService: InventarioService) {}

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Get('existencias')
    getExistencias() {
        return this.inventarioService.getExistencias();
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Get('kardex/:productoId')
    getKardex(@Param('productoId', ParseIntPipe) productoId: number) {
        return this.inventarioService.getKardex(productoId);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Get('recepciones')
    getRecepciones() {
        return this.inventarioService.getRecepciones();
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Get('movimientos-internos')
    getMovimientosInternos() {
        return this.inventarioService.getMovimientosInternos();
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Post('recepciones')
    registrarRecepcion(
        @Body('productoId', ParseIntPipe) productoId: number,
        @Body('cantidad', ParseIntPipe) cantidad: number,
        @Body('motivo') motivo?: string,
    ) {
        return this.inventarioService.registrarRecepcion(productoId, cantidad, motivo);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Post('movimientos-internos')
    registrarMovimientoInterno(
        @Body('productoId', ParseIntPipe) productoId: number,
        @Body('origen') origen: 'principal' | 'averias',
        @Body('destino') destino: 'principal' | 'averias',
        @Body('cantidad', ParseIntPipe) cantidad: number,
        @Body('motivo') motivo?: string,
    ) {
        return this.inventarioService.registrarMovimientoInterno(productoId, origen, destino, cantidad, motivo);
    }
}
