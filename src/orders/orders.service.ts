import { Injectable } from '@nestjs/common';
import { CreateOrderDto, CreateOrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { asyncHandler } from 'src/utils/helpers';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './entities/order.entity';
import mongoose, { Model } from 'mongoose';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { CreateProductDto } from 'src/products/dto/create-product.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly productService: ProductsService,
  ) {}

  create(createOrderDto: CreateOrderDto) {
    const orderId = new mongoose.Types.ObjectId();
    const order = new this.orderModel({
      _id: orderId,
      initial_item_count: 0,
      initial_single_item_count: 0,
      total_cost: 0,
      total_potential_cash_earnings: 0,
      total_potential_credit_earnings: 0,
    });
    const existingProductsDto: CreateOrderItemDto[] = [];
    const newProductsDto: CreateOrderItemDto[] = [];

    for (let item of createOrderDto.items) {
      order.initial_single_item_count++;
      order.initial_item_count += item.units;
      order.total_cost += item.cost * item.units;

      if (item.existance_type === 'existing') {
        existingProductsDto.push(item);
      } else {
        newProductsDto.push(item);
        order.total_potential_cash_income += item.cash_price * item.units;
        order.total_potential_credit_income += item.credit_price * item.units;
      }
    }

    /*     const existingProducts = createOrderDto.items.filter((i) => {
      order.initial_single_item_count++;
      order.initial_item_count += i.units;
      order.total_cost += i.cost * ;
      return i.existance_type === 'existing';
    }); */
    const existingProductsIds = existingProductsDto.map((i) => i.product_id);

    return {
      message: 'OK',
    };
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  private orderItemToProductDTO(
    orderItem: CreateOrderItemDto,
    options?: { withDate?: Date },
  ): CreateProductDto {
    const productDto = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: orderItem.name,
      cost: orderItem.cost,
      register_date: options.withDate || new Date(),
      sale_units: orderItem.units,
      supply_units: orderItem.supply_units,
      sell_price_cash: orderItem.cash_price,
      sell_price_credit: orderItem.credit_price,
    };

    return productDto;
  }
}
