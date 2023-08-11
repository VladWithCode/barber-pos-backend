import { Injectable } from '@nestjs/common';
import { CreateProductDto, TCreateProductData } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PriceEntry, Product } from './entities/product.entity';
import { ClientSession, Model } from 'mongoose';
import { asyncHandler } from 'src/utils/helpers';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async create(createProductDto: TCreateProductData, session?: ClientSession) {
    const price_entry: PriceEntry = {
      unit_count: createProductDto.stock || 1,
      units_sold: 0,
      amount: this.numberToSafeAmount(createProductDto.buy_price),
      registeredBy: '',
      registeredOn: new Date(),
    };

    const [createError, product] = await asyncHandler(
      this.productModel.create(
        [
          {
            ...createProductDto,
            buy_prices: [price_entry],
            buy_price: price_entry.amount,
            sell_price_cash: this.numberToSafeAmount(
              createProductDto.sell_price_cash,
            ),
            sell_price_credit: this.numberToSafeAmount(
              createProductDto.sell_price_credit,
            ),
          },
        ],
        { session },
      ),
    );

    if (createError) throw createError;

    return product;
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
