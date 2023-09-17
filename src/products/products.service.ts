import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductUses, StockEntry } from './entities/product.entity';
import { Document, Model, mongo } from 'mongoose';
import { ImageService } from 'src/images/images.service';
import * as path from 'path';
import { asyncHandler } from 'src/utils/helpers';
import { SaleItem } from 'src/sales/entities/sale.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly imagesService: ImageService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const registerDate = createProductDto.register_date || new Date();
    const product = this.productFromDTO(createProductDto, {
      withDate: registerDate,
    });

    const savedProduct = await product.save();

    return savedProduct;
  }

  async createBulk(createProductDtos: CreateProductDto[]) {
    const registerDate = new Date();
    const products = createProductDtos.map((dto) =>
      this.productFromDTO(dto, { withDate: registerDate }),
    );

    try {
      const saveResult = await this.productModel.bulkSave(products);

      return { message: 'Productos agregados con exito' };
    } catch (e) {
      return new HttpException(
        { message: 'Error al guardar los productos' },
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findAll({ search = '', limit = 0, skip = 0 }) {
    const findQuery = search.length > 0 ? { $text: { $search: search } } : {};
    const products = await this.productModel
      .find(findQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    return products;
  }

  async find({
    match,
    lean,
    limit,
    skip,
  }: {
    match?: Record<string, any>;
    limit?: number;
    skip?: number;
    lean?: boolean;
  }) {
    const findQuery = this.productModel.find(match || {});

    if (lean) findQuery.lean();
    if (limit) findQuery.limit(limit);
    if (skip) findQuery.skip(skip);

    const products = await findQuery.exec();

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

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productModel.findById(id);

    if (!product)
      throw new HttpException(
        { message: 'Producto inexistente' },
        HttpStatus.NOT_FOUND,
      );

    product.set({
      ...updateProductDto,
    });

    try {
      await product.save();
      return {
        message: 'Producto actualizado.',
      };
    } catch (e) {
      console.error(e);
      throw new HttpException(
        { message: 'Error al actualizar el producto' },
        HttpStatus.BAD_REQUEST,
        { cause: e },
      );
    }
  }

  async updatePicture(id: string, picture: Buffer) {
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

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete({ _id: id });

    if (!product)
      return {
        message:
          'No se eliminó ningún producto. El producto que deseas eliminar podría ya no existir',
      };

    let wasImageDeleted = true;

    try {
      await this.imagesService.deleteFile(path.parse(product.picture).name);
    } catch (e) {
      console.error(e);
      wasImageDeleted = false;
    }

    return {
      message: 'Producto eliminado con exito',
      wasImageDeleted,
    };
  }

  async deletePicture(id: string) {
    const product = await this.productModel.findById(id);

    if (!product)
      throw new HttpException(
        { message: 'Producto inexistente' },
        HttpStatus.BAD_REQUEST,
      );

    if (!product.picture)
      return { message: 'Este producto no tiene una imagen asociada' };

    try {
      await this.imagesService.deleteFile(path.parse(product.picture).name);

      product.picture = '';

      await product.save();

      return {
        message: 'Imagen eliminada con exito',
      };
    } catch (e) {
      throw new HttpException(
        {
          message: 'Error al eliminar la imagen asociada a este producto',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateProductsOnSale({
    soldItems,
    isCashSale,
  }: {
    soldItems: SaleItem[];
    isCashSale: boolean;
  }) {
    const hashedItems: Record<string, SaleItem> = {};
    const productIds = soldItems.map((item) => {
      hashedItems[item.product.toString()] = item;
      return item.product;
    });

    const products = await this.productModel.find({
      _id: {
        $in: productIds,
      },
    });

    products.forEach((product) => {
      const item = hashedItems[product._id.toString()];
      const stockEntry = product.stocks.find(
        (stock: StockEntry & Document) =>
          stock._id.toString() === item.stock_entry_id,
      );

      stockEntry.units_available -= item.quantity;
      stockEntry.units_sold += item.quantity;

      if (isCashSale)
        stockEntry.utility =
          (stockEntry.utility || 0) + item.sale_price - stockEntry.buy_price;
    });

    const saveResult = await this.productModel.bulkSave(products);

    return saveResult.modifiedCount === products.length;
  }

  async updateStock() {}

  private productFromDTO(dto: CreateProductDto, options?: { withDate: Date }) {
    const resultProduct = new this.productModel({
      ...dto,
      sell_price_cash: this.numberToSafeAmount(dto.sell_price_cash),
      sell_price_credit: this.numberToSafeAmount(dto.sell_price_credit),
    });
    const defaultSaleStockId = new mongo.ObjectId();
    const defaultSupplyStockId = new mongo.ObjectId();
    const stockEntries: StockEntry[] = [
      {
        _id: defaultSaleStockId,
        buy_price: this.numberToSafeAmount(dto.buy_price),
        use: ProductUses.VENTA,
        units_available: dto.sale_units,
        units_sold: 0,
        date_registered: options?.withDate || dto.register_date,
      },
      {
        _id: defaultSupplyStockId,
        buy_price: this.numberToSafeAmount(dto.buy_price),
        use: ProductUses.INSUMO,
        units_available: dto.supply_units,
        units_sold: 0,
        date_registered: options?.withDate || dto.register_date,
      },
    ];

    resultProduct.stocks = stockEntries;
    resultProduct.default_sale_stock_id = defaultSaleStockId.toString();
    resultProduct.default_supply_stock_id = defaultSupplyStockId.toString();

    return resultProduct;
  }

  private numberToSafeAmount(n: number): number {
    let safeN = 0;
    const [i, d] = n.toFixed(2).split('.');

    safeN += parseInt(d);

    safeN += parseInt(i) * 100;

    return safeN;
  }
}
