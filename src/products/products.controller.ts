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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharpPipe } from 'src/images/pipes/sharp-pipe/sharp-pipe.pipe';
import { BulkUploadPipe } from './pipes/bulk-upload.pipe';
import { InventoryEntryDto } from './dto/inventory-entrance.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/users/entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post('bulk')
  async createBulk(@Body() createProductDtos: CreateProductDto[]) {
    return this.productsService.createBulk(createProductDtos);
  }

  @Post('bulk-file')
  @UseInterceptors(FileInterceptor('products_data'))
  async createBulkFromFile(
    @UploadedFile(BulkUploadPipe) productsData: CreateProductDto[],
  ) {
    return this.productsService.createBulk(productsData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER, UserRoles.ADMIN)
  @Patch('inventory-entry')
  async registerEntry(
    @Body() data: { entry: InventoryEntryDto; newProducts: CreateProductDto[] },
  ) {
    return this.productsService.registerInventoryEntry(
      data.entry,
      data.newProducts,
    );
  }

  @Get()
  findAll(
    @Query('search') search: string,
    @Query('limit') limit: number,
    @Query('skip') skip: number,
  ) {
    return this.productsService.findAll({ search, limit, skip });
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
