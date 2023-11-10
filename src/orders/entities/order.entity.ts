import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Product, ProductSchema } from 'src/products/entities/product.entity';

export type OrderDoc = HydratedDocument<Order>;

@Schema()
export class Order {
  @Prop()
  request_date: Date;

  @Prop()
  arrival_date: Date;

  @Prop()
  initial_item_count: number;

  @Prop()
  initial_single_item_count: number;

  @Prop()
  current_item_count: number;

  @Prop()
  current_single_item_count: number;

  @Prop({ type: [ProductSchema] })
  items: Partial<Product>[];

  @Prop()
  total_cost: number;

  @Prop()
  avg_product_cost: number;

  @Prop()
  total_potential_cash_utility: number;

  @Prop()
  total_potential_cash_income: number;

  @Prop()
  total_potential_credit_utility: number;

  @Prop()
  total_potential_credit_income: number;

  @Prop()
  cash_income: number;

  @Prop({ default: 0 })
  cash_utility: number;

  @Prop({ default: 0 })
  expected_credit_utility: number;

  @Prop({ default: 0 })
  expected_credit_income: number;

  @Prop({ default: 0 })
  current_credit_utility: number;

  @Prop({ default: 0 })
  current_credit_income: number;

  @Prop({ default: 0 })
  total_utility: number;

  @Prop({ default: 0 })
  total_income: number;

  @Prop({ default: 0 })
  credit_sales: number;

  @Prop({ default: 0 })
  cash_sales: number;

  @Prop()
  sales: string[];

  @Prop({ default: 0 })
  single_items_sold: number;

  @Prop({ default: 0 })
  total_items_sold: number;

  @Prop({
    type: new MongooseSchema({
      cash: { type: Number, default: 0 },
      card: { type: Number, default: 0 },
      transfer: { type: Number, default: 0 },
    }),
  })
  income_by_payment_method: { cash: number; card: number; transfer: number };

  @Prop()
  registered_by: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
