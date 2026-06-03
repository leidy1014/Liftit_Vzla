import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('compras')
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin')
export class ComprasController {
    constructor(private readonly comprasService: ComprasService) {}

    @Get()
    getAll() {
        return this.comprasService.getAll();
    }

    @Get('proveedor/:id')
    getHistorialProveedor(@Param('id', ParseIntPipe) id: number) {
        return this.comprasService.getHistorialProveedor(id);
    }

    @Get(':id')
    getById(@Param('id', ParseIntPipe) id: number) {
        return this.comprasService.getById(id);
    }

    @Post()
    crear(
        @Body('proveedorId') proveedorId: number,
        @Body('items') items?: any[],
        @Body('facturaProveedor') facturaProveedor?: string,
        @Body('fechaVencimiento') fechaVencimiento?: string,
    ) {
        return this.comprasService.crear(proveedorId, items ?? [], facturaProveedor, fechaVencimiento);
    }

    @Put(':id')
    actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body('proveedorId') proveedorId: number,
        @Body('items') items?: any[],
        @Body('facturaProveedor') facturaProveedor?: string,
        @Body('fechaVencimiento') fechaVencimiento?: string,
    ) {
        return this.comprasService.actualizar(id, proveedorId, items ?? [], facturaProveedor, fechaVencimiento);
    }

    @Post(':id/recibir')
    recibir(@Param('id', ParseIntPipe) id: number) {
        return this.comprasService.recibir(id);
    }

    @Post(':id/cancelar')
    cancelar(@Param('id', ParseIntPipe) id: number) {
        return this.comprasService.cancelar(id);
    }
}
