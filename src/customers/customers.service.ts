import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, MongooseError } from 'mongoose';
import { Customer, CustomerDocument } from './entities/customer.entity';
import { asyncHandler } from 'src/utils/helpers';
import { SaleDocument } from 'src/sales/entities/sale.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const customer = new this.customerModel(createCustomerDto);

    try {
      return await customer.save();
    } catch (e) {
      console.error(e);
      throw new HttpException(
        {
          message: 'Error al guardar el cliente',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async find({
    search = '',
    limit,
    skip,
    active_credits,
  }: {
    search: string;
    limit: number;
    skip: number;
    active_credits?: boolean;
  }) {
    const filter = search.length > 0 ? { $text: { $search: search } } : {};

    if (active_credits) filter['active_credits'] = { $gt: 0 };

    const findQuery = this.customerModel.find(filter);

    if (limit && limit > 0) findQuery.limit(limit);

    if (skip && skip > 0) findQuery.skip(skip);

    return await findQuery.lean();
  }

  async findAll() {
    const customers = await this.customerModel.find().lean();

    if (!customers || customers.length === 0) {
      throw new HttpException(
        { message: 'No se encontraron clientes' },
        HttpStatus.NOT_FOUND,
      );
    }

    return customers;
  }

  async findOne(id: string) {
    const customer = await this.customerModel.findById(id);

    if (!customer) {
      throw new HttpException(
        { message: 'No se encontró el cliente' },
        HttpStatus.NOT_FOUND,
      );
    }

    return customer;
  }

  async getPaymentInfo(id: string) {
    const [findError, [customer]] = await asyncHandler(
      this.customerModel.aggregate<
        CustomerDocument & { sales_data: SaleDocument[] }
      >([
        {
          $match: { _id: new mongoose.Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: 'sales',
            let: {
              sales: '$sales',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: [
                      {
                        $toString: '$_id',
                      },
                      '$$sales',
                    ],
                  },
                  payment_type: 'credit',
                  status: { $ne: 'paid' },
                },
              },
              {
                $project: {
                  credit_start_date: '$credit_start_date',
                  credit_end_date: '$credit_end_date',
                  total_amount: '$total_amount',
                  paid_amount: '$paid_amount',
                  installment: '$installment',
                  pending_amount: '$pending_amount',
                  item_count: { $size: '$items' },
                  status: '$status',
                  interest_pending: '$interest_pending',
                },
              },
            ],
            as: 'sales_data',
          },
        },
        {
          $project: {
            fullname: '$fullname',
            phone: '$phone',
            sales_data: '$sales_data',
            active_credits: '$active_credits',
          },
        },
      ]),
    );

    if (findError)
      throw new HttpException(
        {
          message: 'Ocurrio un error al buscar al cliente en la base de datos',
          error: findError,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    if (!customer)
      throw new HttpException(
        {
          message: 'El cliente solicitado no existe o fue eliminado',
        },
        HttpStatus.NOT_FOUND,
      );

    // calculate payment amounts
    let totalPendingPayment = 0;
    let expectedPaymentAmount = 0;
    let hasOverduePayments = false;

    for (const sale of customer.sales_data) {
      totalPendingPayment += sale.pending_amount;
      expectedPaymentAmount += sale.installment;
      if (sale.status === 'over_due') hasOverduePayments = true;
    }

    return {
      customerData: customer,
      paymentData: {
        totalPendingPayment,
        expectedPaymentAmount,
        hasOverduePayments,
      },
    };
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customerModel.findById(id);

    if (!customer) {
      throw new HttpException(
        { message: 'No se encontró el cliente' },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      customer.set(updateCustomerDto);

      return await customer.save();
    } catch (e) {
      console.error(e);
      throw new HttpException(
        {
          message: 'Error al actualizar el cliente',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    const removeResult = await this.customerModel.deleteOne({ _id: id });

    if (removeResult.deletedCount === 0) {
      throw new HttpException(
        { message: 'No se encontró el cliente' },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: 'Cliente eliminado',
    };
  }
}
