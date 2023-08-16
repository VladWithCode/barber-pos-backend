import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Put,
  UploadedFile,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharpPipe } from 'src/images/pipes/sharp-pipe/sharp-pipe.pipe';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post(':id/picture')
  @UseInterceptors(FileInterceptor('picture'))
  async uploadPicture(
    @Param('id') id: string,
    @UploadedFile(SharpPipe) picture: Buffer,
  ) {
    return this.productsService.uploadPictures(id, picture);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Put(':id/picture')
  @UseInterceptors(FileInterceptor('picture'))
  async updatePictures(
    @Param('id') id: string,
    @UploadedFile(SharpPipe) picture: Buffer,
  ) {}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
