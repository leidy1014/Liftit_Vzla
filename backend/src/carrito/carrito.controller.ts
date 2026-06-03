import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, Request, Body } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { CarritoService } from './carrito.service';

@Controller('carrito')
export class CarritoController {
    constructor(private readonly carritoService: CarritoService) {}

    @UseGuards(JwtGuard)
    @Get()
    getCarrito(@Request() req) { 
        return this.carritoService.getCarrito(req.user.id);
     }

    @UseGuards(JwtGuard)
    @Post('items')
    agregarItem(@Request() req, @Body() body: { productoId: number; cantidad: number }) {
        return this.carritoService.agregarItem(req.user.id, body.productoId, body.cantidad);
    }

    @UseGuards(JwtGuard)
    @Patch('items/:id')
    actualizarItem(@Param('id', ParseIntPipe) id: number, @Body() body: { cantidad: number }) {
        return this.carritoService.actualizarItem(id, body.cantidad);
    }

    @UseGuards(JwtGuard)
    @Delete('items/:id')
    eliminarItem(@Param('id', ParseIntPipe) id: number) {
        return this.carritoService.eliminarItem(id);
    }

    @UseGuards(JwtGuard)
    @Post('checkout')
    checkout(@Request() req) {
        return this.carritoService.checkout(req.user.id);
    }
}
