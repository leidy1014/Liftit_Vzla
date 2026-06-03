import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { GastosService } from './gastos.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('gastos')
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin')
export class GastosController {
    constructor(private readonly gastosService: GastosService) {}

    @Get()
    getAll(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
        return this.gastosService.getAll(desde, hasta);
    }

    @Get('resumen')
    getResumen(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
        return this.gastosService.getResumen(desde, hasta);
    }

    @Post()
    crear(@Body() dto: any) {
        return this.gastosService.crear(dto);
    }

    @Put(':id')
    actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
        return this.gastosService.actualizar(id, dto);
    }

    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.gastosService.eliminar(id);
    }
}
