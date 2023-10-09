import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, MongooseError } from 'mongoose';
import { Customer, CustomerDocument } from './entities/customer.entity';

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
    active,
  }: {
    search: string;
    limit: number;
    skip: number;
    active?: boolean;
  }) {
    const filter = search.length > 0 ? { $text: { $search: search } } : {};
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
    const customer = await this.customerModel.findById(id).lean();

    if (!customer) {
      throw new HttpException(
        { message: 'No se encontró el cliente' },
        HttpStatus.NOT_FOUND,
      );
    }

    return customer;
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
