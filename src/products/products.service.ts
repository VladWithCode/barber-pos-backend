import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductUses, StockEntry } from './entities/product.entity';
import { Model } from 'mongoose';
import { ImageService } from 'src/images/images.service';
import * as path from 'path';
import { asyncHandler } from 'src/utils/helpers';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly imagesService: ImageService,
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

  async uploadPictures(id: string, picture: Buffer) {
    const product = await this.productModel.findById(id);
    const productSlug = product.name
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .join('-');

    const [writeError] = await asyncHandler(
      this.imagesService.writeFile({
        filename: productSlug + '.webp',
        buffer: picture,
      }),
    );

    if (writeError) {
      console.error(writeError);
      throw new HttpException(
        { message: 'Error al guardar imagenes.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    product.picture = '/images/' + productSlug + '.webp';

    await product.save();

    return product;
  }

  async findAll() {
    const products = await this.productModel.find().lean();

    return products;
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id).lean();

    if (!product)
      return {
        message: 'No se encontró el producto con id: ' + id,
      };

    return { product };
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async updatePictures(id: string, pictures: Buffer[]) {
    const product = await this.productModel.findById(id);
    const pictureFilePath = path.join(process.cwd(), 'public/images');
    const productSlug = product.name
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .join('-');

    await product.save();

    return product;
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
