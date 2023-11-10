import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderItemDoc = HydratedDocument<OrderItem>;

export const ItemExistanceTypes = {
  NEW: 'new',
  EXISTING: 'existing',
} as const;

export type ItemExistance =
  (typeof ItemExistanceTypes)[keyof typeof ItemExistanceTypes];

@Schema()
export class OrderItem {
  @Prop({ enum: Object.values(ItemExistanceTypes) })
  existance_type: ItemExistance;

  @Prop({ required: true })
  product_id: string;

  @Prop({ required: true })
  product_stock_id: string;

  @Prop({ required: true })
  unit_cost: number;

  @Prop({ required: true })
  total_cost: number;

  @Prop({ default: 1 })
  available_units: number;

  @Prop({ default: 0 })
  sold_units: number;

  @Prop({ default: 1 })
  initial_units: number;

  @Prop({ default: 0 })
  initial_supply_units: number;

  @Prop()
  cash_sales: number;

  @Prop()
  credit_sales: number;

  @Prop()
  sales: string;

  @Prop()
  total_potential_cash_earnings: number;

  @Prop()
  total_potential_credit_earnings: number;

  @Prop({ default: 0 })
  cash_utility: number;

  @Prop({ default: 0 })
  expected_credit_utility: number;

  @Prop({ default: 0 })
  current_credit_utility: number;

  @Prop({ default: 0 })
  total_utility: number;

  @Prop()
  credit_pending_payment_amount: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
