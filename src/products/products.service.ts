import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Product,
  ProductDocument,
  ProductUses,
  StockEntry,
} from './entities/product.entity';
import { Document, Model, mongo } from 'mongoose';
import { ImageService } from 'src/images/images.service';
import * as path from 'path';
import { asyncHandler } from 'src/utils/helpers';
import { SaleItem } from 'src/sales/entities/sale.entity';
import {
  EntryProductDto,
  InventoryEntryDto,
} from './dto/inventory-entrance.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly imagesService: ImageService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const registerDate = createProductDto.register_date || new Date();
    const product = this.createProductFromDTO(createProductDto, {
      withDate: registerDate,
    });

    const savedProduct = await product.save();

    return savedProduct;
  }

  async createBulk(
    createProductDtos: CreateProductDto[],
    opts: { withDate?: Date } = {},
  ) {
    const registerDate = opts.withDate || new Date();
    const products = createProductDtos.map((dto) =>
      this.createProductFromDTO(dto, { withDate: registerDate }),
    );

    try {
      const saveResult = await this.productModel.bulkSave(products);

      return {
        message: 'Productos agregados con exito',
        savedIds: saveResult.insertedIds,
      };
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
    const prodCount = await this.productModel.countDocuments(findQuery);
    const products = await this.productModel
      .find(findQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const result = {
      products,
    };

    if (products.length < limit || skip + limit >= prodCount)
      result['hasNextPage'] = false;

    if (skip + limit < prodCount) result['hasNextPage'] = true;

    return result;
  }

  async find({ match }: { match?: Record<string, any> }) {
    const products = await this.productModel.find(match || {}).exec();

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

  async bulkPictureUpdate() {}

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

  async registerInventoryEntry(
    entry: InventoryEntryDto,
    newProducts: CreateProductDto[],
  ) {
    let products: (Product & ProductDocument)[] = [];

    if (entry.products?.length > 0) {
      products = await this.productModel.find({
        _id: {
          $in: entry.products.map((p) => p._id),
        },
      });
    }

    const productsToCreate = newProducts.map((p) =>
      this.createProductFromDTO(p, { withDate: entry.entry_date }),
    );
    const productsToUpdate = products.map((p) => {
      const newStockEntries = this.createStockEntries(
        p,
        entry.products.find(
          (entryProduct) => entryProduct._id === p._id.toString(),
        ),
        entry.entry_date,
      );

      return {
        _id: p._id,
        stocks: [...p.stocks, ...newStockEntries],
      };
    });
    const writeOperations = [];

    if (productsToCreate.length > 0) {
      for (let product of productsToCreate) {
        writeOperations.push({
          insertOne: {
            document: product,
          },
        });
      }
    }

    if (productsToUpdate.length > 0) {
      for (let product of productsToUpdate) {
        writeOperations.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              stocks: product.stocks,
            },
          },
        });
      }
    }

    const saveResult = await this.productModel.bulkWrite(writeOperations);

    let resultResponse = {
      success: true,
      messages: [],
    };

    if (saveResult.insertedCount !== productsToCreate.length) {
      resultResponse.success = false;
      resultResponse.messages.push(
        saveResult.insertedCount === 0
          ? 'No se crearon nuevos productos'
          : 'Algunos productos no han sido creados',
      );
      resultResponse['createdIds'] = Object.values(saveResult.insertedIds);
    }

    if (saveResult.modifiedCount !== productsToUpdate.length) {
      resultResponse.success = false;
      resultResponse.messages.push(
        saveResult.modifiedCount === 0
          ? 'No se actualizaron los productos'
          : 'Algunos productos no han sido actualizados',
      );
      resultResponse['updatedIds'] = Object.values(saveResult.upsertedIds);
    }

    if (resultResponse.success)
      resultResponse.messages.push('Entrada registrada con exito');

    return resultResponse;
  }

  private createProductFromDTO(
    dto: CreateProductDto,
    options?: { withDate: Date },
  ) {
    const resultProduct = new this.productModel({
      ...dto,
      sell_price_cash: this.numberToSafeAmount(dto.sell_price_cash),
      sell_price_credit: this.numberToSafeAmount(dto.sell_price_credit),
    });
    const stockEntries: StockEntry[] = this.createStockEntries(
      resultProduct,
      dto,
      options?.withDate || dto.register_date,
    );

    let defaultSupplyStockId: mongo.ObjectId;
    let defaultSaleStockId: mongo.ObjectId;

    for (let stock of stockEntries) {
      if (stock.use === ProductUses.INSUMO) {
        defaultSupplyStockId = stock._id;
        continue;
      }

      if (stock.use === ProductUses.VENTA) {
        defaultSaleStockId = stock._id;
        continue;
      }
    }

    resultProduct.stocks = stockEntries;
    resultProduct.default_sale_stock_id = defaultSaleStockId.toString();
    resultProduct.default_supply_stock_id = defaultSupplyStockId.toString();

    return resultProduct;
  }

  private createStockEntries(
    product: ProductDocument,
    dto: CreateProductDto | EntryProductDto,
    entryDate: Date,
  ) {
    let defaultSaleStock: StockEntry;
    let defaultSupplyStock: StockEntry;

    for (let stock of product.stocks) {
      if (defaultSaleStock && defaultSupplyStock) break;

      if (stock._id.toString() === product.default_sale_stock_id) {
        defaultSaleStock = stock;
        continue;
      }

      if (stock._id.toString() === product.default_supply_stock_id) {
        defaultSupplyStock = stock;
        continue;
      }
    }

    const newStockEntries: StockEntry[] = [
      {
        _id: new mongo.ObjectId(),
        buy_price: dto.buy_price || defaultSaleStock.buy_price,
        use: ProductUses.VENTA,
        units_available: dto.sale_units,
        units_sold: 0,
        date_registered: entryDate,
      },
      {
        _id: new mongo.ObjectId(),
        buy_price: dto.buy_price || defaultSupplyStock.buy_price,
        use: ProductUses.INSUMO,
        units_available: dto.supply_units,
        units_sold: 0,
        date_registered: entryDate,
      },
    ];

    return newStockEntries;
  }

  private numberToSafeAmount(n: number): number {
    if (Number.isNaN(+n)) return 0;

    let safeN = 0;
    const [i, d] = n.toFixed(2).split('.');

    safeN += parseInt(d);

    safeN += parseInt(i) * 100;

    return safeN;
  }
}
