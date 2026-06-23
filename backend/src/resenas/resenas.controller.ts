import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ResenasService } from './resenas.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('resenas')
export class ResenasController {
  constructor(private readonly resenasService: ResenasService) {}

  @Get('resumen')
  getResumen() {
    return this.resenasService.getResumen();
  }

  @Get('producto/:id')
  getByProducto(@Param('id', ParseIntPipe) id: number) {
    return this.resenasService.getByProducto(id);
  }

  @UseGuards(JwtGuard)
  @Post()
  crear(
    @Req() req: any,
    @Body() body: { productoId: number; puntuacion: number; comentario?: string },
  ) {
    return this.resenasService.crear(req.user.id, body.productoId, body.puntuacion, body.comentario);
  }
}
