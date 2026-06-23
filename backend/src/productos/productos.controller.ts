import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { createClient } from '@supabase/supabase-js';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

const FILTRO_IMAGEN = (req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/image\/(jpg|jpeg|png|webp|gif)/)) {
    return cb(new BadRequestException('Solo se permiten imágenes (jpg, png, webp)'), false);
  }
  cb(null, true);
};

const OPCIONES_MULTER = {
  storage: memoryStorage(),
  fileFilter: FILTRO_IMAGEN,
  limits: { fileSize: 5 * 1024 * 1024 },
};

function supabaseClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
}

async function subirAStorage(file: Express.Multer.File): Promise<string> {
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
  const { error } = await supabaseClient().storage
    .from('imagenes')
    .upload(filename, file.buffer, { contentType: file.mimetype, upsert: false });
  if (error) throw new BadRequestException('Error al subir la imagen: ' + error.message);
  return filename;
}

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Post('upload')
  @UseInterceptors(FileInterceptor('imagen', OPCIONES_MULTER))
  async uploadImagen(@UploadedFile() file: Express.Multer.File) {
    const filename = await subirAStorage(file);
    return { filename };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productosService.create(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Patch('reordenar')
  reordenar(@Body() body: { ids: number[] }) {
    return this.productosService.reordenar(body.ids);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateProductoDto>) {
    return this.productosService.update(id, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.remove(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/imagenes')
  @UseInterceptors(FileInterceptor('imagen', OPCIONES_MULTER))
  async agregarImagen(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const filename = await subirAStorage(file);
    return this.productosService.agregarImagen(id, filename);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id/imagenes/:filename')
  eliminarImagen(
    @Param('id', ParseIntPipe) id: number,
    @Param('filename') filename: string,
  ) {
    return this.productosService.eliminarImagen(id, filename);
  }
}
