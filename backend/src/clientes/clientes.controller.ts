import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('clientes')
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}

    @Get()
    getAll() {
        return this.clientesService.getAll();
    }

    @Post()
    crear(
        @Body('nombre') nombre: string,
        @Body('telefono') telefono: string,
        @Body('email') email?: string,
        @Body('documento') documento?: string,
    ) {
        return this.clientesService.crear(nombre, telefono, email, documento);
    }

    @Put(':id')
    actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body('nombre') nombre: string,
        @Body('telefono') telefono: string,
        @Body('email') email?: string,
        @Body('documento') documento?: string,
    ) {
        return this.clientesService.actualizar(id, nombre, telefono, email, documento);
    }

    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.clientesService.eliminar(id);
    }

    @Delete(':id/permanente')
    borrarPermanente(@Param('id', ParseIntPipe) id: number) {
        return this.clientesService.borrarPermanente(id);
    }
}
