import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductUses } from './entities/product.entity';
import { Model } from 'mongoose';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const session = await this.productModel.startSession();

    try {
      session.startTransaction();
      const createSaleProductPromise = this.productsService.create(
        {
          ...createProductDto,
          amount_sale: undefined,
          amount_supply: undefined,
          stock: createProductDto.amount_sale,
          use: ProductUses.VENTA,
        },
        session,
      );
      const createSupplyProductPromise = this.productsService.create(
        {
          ...createProductDto,
          amount_sale: undefined,
          amount_supply: undefined,
          stock: createProductDto.amount_supply,
          use: ProductUses.INSUMO,
        },
        session,
      );

      const [saleProduct, supplyProduct] = await Promise.all([
        createSaleProductPromise,
        createSupplyProductPromise,
      ]);

      await session.commitTransaction();

      return {
        saleProduct,
        supplyProduct,
      };
    } catch (e) {
      await session.abortTransaction();
      return {
        status: 'ERROR',
        message: 'Ocurrió un error al guardar los productos',
      };
    }
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
