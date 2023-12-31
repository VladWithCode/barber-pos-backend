import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateSaleDto,
  CreateSaleItem,
  CreditSaleDto,
} from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';
import { Sale, SaleItem } from './entities/sale.entity';
import { ProductsService } from 'src/products/products.service';
import { addMonths, setDate } from 'date-fns';
import { asyncHandler, isValidId, numberToSafeAmount } from 'src/utils/helpers';
import { CustomerDocument } from 'src/customers/entities/customer.entity';
import { CustomersService } from 'src/customers/customers.service';
import { SavePaymentDto } from './dto/save-payment.dto';
import { WhatsappApiService } from 'src/whatsapp-api/whatsapp-api.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    private readonly productService: ProductsService,
    private readonly customerService: CustomersService,
    private readonly whatsappService: WhatsappApiService,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    const hashedItems: Record<string, CreateSaleItem> = {};
    let total = 0;
    let paid_amount = numberToSafeAmount(createSaleDto.deposit);
    let customer: CustomerDocument | null = null;
    let customerName = createSaleDto.customer;

    if (isValidId(createSaleDto.customer)) {
      let findCustomerError: Error;

      [findCustomerError, customer] = await asyncHandler(
        this.customerService.findOne(createSaleDto.customer),
      );

      if (findCustomerError)
        throw new HttpException(
          {
            message:
              'Ocurrio un error al buscar al cliente en la base de datos.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      if (!customer) {
        throw new HttpException(
          {
            message: 'El cliente no se encontró en la Base de Datos',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      customerName = customer.fullname;
    }

    const products = await this.productService.find({
      match: {
        _id: {
          $in: createSaleDto.items.map((item) => {
            hashedItems[item.product] = item;
            return item.product;
          }),
        },
      },
    });

    const notificationItems: (SaleItem & { product_name: string })[] = [];
    const saleItems: SaleItem[] = products.map((product) => {
      const dtoItem = hashedItems[product._id.toString()];

      const salePrice = dtoItem.sale_price
        ? numberToSafeAmount(dtoItem.sale_price)
        : createSaleDto.payment_type === 'cash'
        ? product.sell_price_cash
        : product.sell_price_credit;

      const resultItem = {
        product: product._id,
        quantity: dtoItem.quantity,
        sale_price: salePrice,
        total_price: salePrice * dtoItem.quantity,
        stock_entry_id: dtoItem.stock_entry_id,
      };

      total += resultItem.total_price;

      notificationItems.push({ ...resultItem, product_name: product.name });

      return resultItem;
    });

    if (saleItems.length !== createSaleDto.items.length) {
      throw new HttpException(
        {
          message: 'Algunos productos no se encontraron en la Base de Datos',
          foundProducts: saleItems.map((item) => item.product.toString()),
        },
        404,
      );
    }

    const payment = {
      amount: numberToSafeAmount(createSaleDto.deposit),
      date: createSaleDto.deposit_date || new Date(),
      method: createSaleDto.payment_method,
      received_by: createSaleDto.seller,
    };

    const saleId = new mongo.ObjectId();
    const sale = new this.saleModel({
      ...createSaleDto,
      _id: saleId,
      customer: customer?._id || '',
      customer_name: customerName,
      deposit: numberToSafeAmount(createSaleDto.deposit),
      deposit_date: payment.date,
      paid_amount: paid_amount,
      total_amount: total,
      items: saleItems,
      payments: [payment],
      status: paid_amount === total ? 'paid' : 'pending_payment',
    });

    if (createSaleDto.payment_type === 'credit') {
      const creditFields = this.calculateCreditSaleField(
        sale,
        createSaleDto as CreditSaleDto,
      );

      sale.set(creditFields);
      customer.active_credit_purchases_count++;
      customer.pending_payment_amount += sale.pending_amount;
    }

    customer.sales.push(saleId.toString());

    const [
      saveSaleResult,
      updateProductsResult,
      updateCustomerResult,
      notificationResult,
    ] = await Promise.allSettled([
      sale.save(),
      this.productService.updateProductsOnSale({
        soldItems: saleItems,
        isCashSale: createSaleDto.payment_type === 'cash',
      }),
      customer.save(),
      this.whatsappService.sendPurchaseNotification(
        /* customer.phone */ '6183188452',
        {
          items: notificationItems,
          deposit: sale.deposit,
          installment: sale.installment,
          next_payment_date: sale.next_payment_date,
          pending_amount: sale.pending_amount,
          total_amount: sale.total_amount,
        },
      ),
    ]);

    if (saveSaleResult.status === 'rejected') {
      throw new HttpException(
        {
          message: 'Error al guardar la venta',
          error: saveSaleResult.reason,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const createSaleResult = {
      sale: saveSaleResult.value,
    };

    if (updateProductsResult.status === 'rejected') {
      createSaleResult['updateProductsError'] = updateProductsResult.reason;
    }

    if (updateCustomerResult.status === 'rejected') {
      createSaleResult['updateCustomerError'] = updateCustomerResult.reason;
    }

    if (notificationResult.status === 'rejected') {
      createSaleResult['notificationError'] = notificationResult.reason;
    }

    return createSaleResult;
  }

  async savePayment(saleId: string, paymentDto: SavePaymentDto) {}

  async findAll({
    search = '',
    limit,
    skip,
  }: {
    search: string;
    limit?: number;
    skip?: number;
  }) {
    const filter = search.length > 0 ? { $text: { $search: search } } : {};
    const findQuery = this.saleModel.find(filter);

    if (limit > 0) findQuery.limit(limit);

    if (skip > 0) findQuery.skip(skip);

    return await findQuery.lean().exec();
  }

  async findOne(id: string) {
    const sale = await this.saleModel.findById(id).lean();

    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    const sale = await this.saleModel.findById(id);

    sale.set(updateSaleDto);

    const savedSale = await sale.save();

    return savedSale;
  }

  async remove(id: number) {
    const sale = await this.saleModel.findById(id);

    await sale.deleteOne();
  }

  private calculateCreditSaleField(sale: Sale, createDto: CreditSaleDto) {
    const creditStartDate = sale.deposit_date;
    const creditEndDate =
      createDto.credit_end_date || this.calculateCreditEndDate(creditStartDate);
    const resultFields = {
      credit_start_date: creditStartDate,
      credit_end_date: creditEndDate,
      next_payment_date:
        createDto.next_payment_date ||
        this.generateNextPaymentDate({ last_payment_date: creditStartDate }),
      pending_amount: sale.total_amount - sale.paid_amount,
      installment: 0,
    };
    resultFields.installment = Math.round(resultFields.pending_amount / 6);

    return resultFields;
  }

  private calculateCreditEndDate(startDate: Date) {
    const firstPaymentDate = this.generateNextPaymentDate({
      last_payment_date: startDate,
    });

    return addMonths(firstPaymentDate, 3);
  }

  private generateNextPaymentDate({
    last_payment_date,
  }: {
    last_payment_date: Date;
  }) {
    const PaymentDates = {
      FIRST_HALF: 15,
      LAST_HALF: 30,
    };
    let nextPaymentDate: Date;

    if (last_payment_date.getDate() < PaymentDates.FIRST_HALF) {
      nextPaymentDate = setDate(last_payment_date, PaymentDates.FIRST_HALF);
    } else if (last_payment_date.getDate() < PaymentDates.LAST_HALF) {
      nextPaymentDate = setDate(last_payment_date, PaymentDates.LAST_HALF);
    } else {
      nextPaymentDate = setDate(last_payment_date, PaymentDates.FIRST_HALF);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }

    return nextPaymentDate;
  }
}
