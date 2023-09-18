import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, PopulatedDoc, Types } from 'mongoose';
import { Product } from 'src/products/entities/product.entity';

export const PaymentTypes = {
  CONTADO: 'cash',
  CREDITO: 'credit',
} as const;
export type TPaymentType = (typeof PaymentTypes)[keyof typeof PaymentTypes];

export const PaymentMethods = {
  EFECTIVO: 'cash',
  TARJETA: 'card',
  TRANSFERENCIA: 'transfer',
} as const;
export type TPaymentMethod =
  (typeof PaymentMethods)[keyof typeof PaymentMethods];

export const SaleStatuses = {
  PAGADO: 'paid',
  PENDIENTE: 'pending_payment',
  VENCIDO: 'over_due',
} as const;
export type TSaleStatus = (typeof SaleStatuses)[keyof typeof SaleStatuses];

@Schema()
export class SaleItem {
  @Prop({ ref: 'Product', type: Types.ObjectId, required: true })
  product: PopulatedDoc<Document<Types.ObjectId> & Product>;

  @Prop()
  quantity: number;

  @Prop()
  sale_price: number;

  @Prop()
  total_price: number;

  @Prop()
  stock_entry_id: string;
}
const SaleItemSchema = SchemaFactory.createForClass(SaleItem);

@Schema()
export class Payment {
  @Prop()
  amount: number;

  @Prop()
  date: Date;

  @Prop({ enum: ['cash', 'card', 'transfer'] })
  method: TPaymentMethod;

  @Prop()
  scheduled_date?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  received_by: string;
}
const PaymentSchema = SchemaFactory.createForClass(Payment);

@Schema()
export class Sale {
  @Prop({ type: [SaleItemSchema] })
  items: SaleItem[];

  // TODO: This has to be a ref to the Customer collection
  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customer?: string;

  @Prop()
  customer_name: string;

  // TODO: This has to be a ref to the User collection
  @Prop({ type: Types.ObjectId, ref: 'User' })
  seller: string;

  @Prop({ enum: ['cash', 'credit'] })
  payment_type: TPaymentType;

  @Prop()
  deposit: number;

  @Prop()
  deposit_date: Date;

  @Prop()
  installment: number;

  @Prop()
  paid_amount: number;

  @Prop()
  pending_amount: number;

  @Prop()
  total_amount: number;

  @Prop()
  next_payment_date: Date;

  @Prop()
  last_payment_date: Date;

  @Prop({ type: [PaymentSchema] })
  payments: Payment[];

  @Prop()
  commission: number;

  @Prop()
  total_utility: number;

  @Prop()
  credit_start_date: Date;

  @Prop()
  credit_end_date: Date;

  @Prop({ enum: ['paid', 'pending_payment', 'over_due'] })
  status: TSaleStatus;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);

export type SaleDocument = HydratedDocument<Sale>;
