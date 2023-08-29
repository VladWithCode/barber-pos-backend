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
import { BulkUploadPipe } from './pipes/bulk-upload.pipe';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post('bulk')
  @UseInterceptors(FileInterceptor('products_data'))
  async createBulk(
    @UploadedFile(BulkUploadPipe) productsData: CreateProductDto[],
  ) {
    return this.productsService.createBulk(productsData);
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
  ) {
    return this.productsService.updatePicture(id, picture);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Delete(':id/picture')
  async deletePicture(@Param('id') id: string) {
    return await this.productsService.deletePicture(id);
  }
}
