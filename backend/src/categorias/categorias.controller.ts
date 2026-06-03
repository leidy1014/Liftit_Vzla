import { Controller, Get, Post, Body, UseGuards, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('categorias')
export class CategoriasController {
    constructor(private readonly categoriasService: CategoriasService) {}

    @Get()
    findAll() {
        return this.categoriasService.findAll();
    }

    @Get(':id')
        findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoriasService.findOne(id);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Post()
    create(@Body() dto: CreateCategoriaDto): Promise<import("./categoria.entity").Categoria> {
        return this.categoriasService.create(dto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoriasService.remove(id);
    }
}
 