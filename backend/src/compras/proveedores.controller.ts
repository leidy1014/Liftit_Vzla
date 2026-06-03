import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('proveedores')
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin')
export class ProveedoresController {
    constructor(private readonly proveedoresService: ProveedoresService) {}

    @Get()
    getAll() {
        return this.proveedoresService.getAll();
    }

    @Post()
    crear(
        @Body('nombre') nombre: string,
        @Body('nit') nit?: string,
        @Body('telefono') telefono?: string,
        @Body('email') email?: string,
    ) {
        return this.proveedoresService.crear(nombre, nit, telefono, email);
    }

    @Put(':id')
    actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body('nombre') nombre: string,
        @Body('nit') nit?: string,
        @Body('telefono') telefono?: string,
        @Body('email') email?: string,
    ) {
        return this.proveedoresService.actualizar(id, nombre, nit, telefono, email);
    }

    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.proveedoresService.eliminar(id);
    }

    @Delete(':id/permanente')
    borrarPermanente(@Param('id', ParseIntPipe) id: number) {
        return this.proveedoresService.borrarPermanente(id);
    }
}
