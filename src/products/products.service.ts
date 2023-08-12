import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductUses, StockEntry } from './entities/product.entity';
import { Model } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const registedDate = createProductDto.register_date || new Date();
    const product = new this.productModel({
      ...createProductDto,
      sell_price_cash: this.numberToSafeAmount(
        createProductDto.sell_price_cash,
      ),
      sell_price_credit: this.numberToSafeAmount(
        createProductDto.sell_price_credit,
      ),
    });
    const stockEntries: StockEntry[] = [
      {
        buy_price: this.numberToSafeAmount(createProductDto.buy_price),
        use: ProductUses.VENTA,
        units_available: createProductDto.sale_units,
        units_sold: 0,
        date_registered: registedDate,
      },
      {
        buy_price: this.numberToSafeAmount(createProductDto.buy_price),
        use: ProductUses.INSUMO,
        units_available: createProductDto.supply_units,
        units_sold: 0,
        date_registered: registedDate,
      },
    ];

    product.stocks = stockEntries;

    const savedProduct = await product.save();

    return savedProduct;
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: string) {
    return `This action returns a #${id} product`;
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }

  private numberToSafeAmount(n: number): number {
    let safeN = 0;
    const [i, d] = n.toFixed(2).split('.');

    if (+d > 0) safeN = safeN + parseInt(d);

    safeN = parseInt(i) * 100 + safeN;

    return safeN;
  }
}
