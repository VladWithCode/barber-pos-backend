import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
export class StockEntry {
  @Prop()
  _id: Types.ObjectId;

  @Prop({ enum: ['sale', 'supply'] })
  use: ProductUse;

  @Prop({ required: true })
  buy_price: number;

  @Prop({ default: 0 })
  units_available: number;

  @Prop({ default: 0 })
  units_sold: number;

  @Prop({ default: Date })
  date_registered: Date;

  @Prop({ default: 0 })
  utility?: number;
}

const StockEntrySchema = SchemaFactory.createForClass(StockEntry);

export const ProductUses = {
  VENTA: 'sale',
  INSUMO: 'supply',
} as const;

export type ProductUse = (typeof ProductUses)[keyof typeof ProductUses];
export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({ required: true, text: true })
  name: string;

  @Prop({ index: true })
  barcode: string;

  @Prop({ maxlength: 300 })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: string;

  @Prop({ type: Types.ObjectId, ref: 'Subcategory', required: true })
  subcategory: string;

  @Prop({ type: [StockEntrySchema], default: [] })
  stocks: StockEntry[];

  @Prop()
  sell_price_cash: number;

  @Prop()
  sell_price_credit: number;

  @Prop()
  picture: string;

  @Prop({ default: true })
  credit_available: boolean;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: 0 })
  total_utility: number;

  @Prop()
  default_sale_stock_id: string;

  @Prop()
  default_supply_stock_id: string;

  /*   // Props tentativas
  @Prop()
  last_sold: Date;

  // @Prop({ type: Schema.Types.ObjectId, ref: 'Supplier' })
  // supplier: Supplier;

  @Prop()
  last_restock: Date;

  // TODO: This would be a ref to a User in DB
  @Prop()
  added_by: string; */
}

export const ProductSchema = SchemaFactory.createForClass(Product);
