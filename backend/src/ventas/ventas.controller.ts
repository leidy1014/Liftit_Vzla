import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('ventas')
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin')
export class VentasController {
    constructor(private readonly ventasService: VentasService) {}

    @Get()
    getAll() {
        return this.ventasService.getAll();
    }

    @Get('reporte/margenes')
    getReporteMargenes(
        @Query('desde') desde?: string,
        @Query('hasta') hasta?: string,
    ) {
        return this.ventasService.getReporteMargenes(desde, hasta);
    }

    @Get('cliente/:clienteId')
    getByCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
        return this.ventasService.getByCliente(clienteId);
    }

    @Get(':id')
    getById(@Param('id', ParseIntPipe) id: number) {
        return this.ventasService.getById(id);
    }

    @Post()
    crear(
        @Body('clienteNombre') clienteNombre: string,
        @Body('clienteId') clienteId?: number,
        @Body('items') items?: any[],
    ) {
        return this.ventasService.crear(clienteNombre, items ?? [], clienteId);
    }

    @Put(':id')
    actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body('clienteNombre') clienteNombre: string,
        @Body('clienteId') clienteId?: number,
        @Body('items') items?: any[],
    ) {
        return this.ventasService.actualizar(id, clienteNombre, items ?? [], clienteId);
    }

    @Post(':id/anular')
    anular(@Param('id', ParseIntPipe) id: number) {
        return this.ventasService.anular(id);
    }

    @Post(':id/reactivar')
    reactivar(@Param('id', ParseIntPipe) id: number) {
        return this.ventasService.reactivar(id);
    }

    @Post(':id/confirmar')
    confirmar(@Param('id', ParseIntPipe) id: number) {
        return this.ventasService.confirmar(id);
    }

    @Post(':id/cancelar')
    cancelar(@Param('id', ParseIntPipe) id: number) {
        return this.ventasService.cancelar(id);
    }

    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.ventasService.eliminar(id);
    }
}
