import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateSaleDto,
  CreateSaleItem,
  CreditSaleDto,
} from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale, SaleItem } from './entities/sale.entity';
import { ProductsService } from 'src/products/products.service';
import { addMonths, setDate } from 'date-fns';
import { isValidId, numberToSafeAmount } from 'src/utils/helpers';
import { CustomerDocument } from 'src/customers/entities/customer.entity';
import { CustomersService } from 'src/customers/customers.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    private readonly productService: ProductsService,
    private readonly customerService: CustomersService,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    const hashedItems: Record<string, CreateSaleItem> = {};
    let total = 0;
    let paid_amount = numberToSafeAmount(createSaleDto.deposit);
    let customer: CustomerDocument | null = null;
    let customerName = createSaleDto.customer;

    if (isValidId(createSaleDto.customer)) {
      console.log(createSaleDto.customer.length);
      customer = await this.customerService.findOne(createSaleDto.customer);

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

    const sale = new this.saleModel({
      ...createSaleDto,
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
    }

    const [saveSaleResult, updateProductsResult] = await Promise.allSettled([
      await sale.save(),
      await this.productService.updateProductsOnSale({
        soldItems: saleItems,
        isCashSale: createSaleDto.payment_type === 'cash',
      }),
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

    return createSaleResult;
  }

  async findAll() {
    const sales = await this.saleModel.find().lean();

    return sales;
  }

  async findOne(id: number) {
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
