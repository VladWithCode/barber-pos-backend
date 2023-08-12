import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class StockEntry {
  @Prop({ enum: ['sale', 'supply'] })
  use: ProductUse;

  @Prop()
  buy_price: number;

  @Prop({ default: 1 })
  units_available: number;

  @Prop({ default: 0 })
  units_sold: number;

  @Prop({ default: Date })
  date_registered: Date;
}

const StockEntrySchema = SchemaFactory.createForClass(StockEntry);

export const ProductUses: { VENTA: 'sale'; INSUMO: 'supply' } = {
  VENTA: 'sale',
  INSUMO: 'supply',
};

export type ProductUse = (typeof ProductUses)[keyof typeof ProductUses];
export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({ required: true, text: true, unique: true })
  name: string;

  @Prop({ type: String, index: true })
  barcode: string;

  @Prop({ maxlength: 180 })
  description: string;

  @Prop({ type: String })
  category: string;

  @Prop({ type: [StockEntrySchema], default: [] })
  stocks: StockEntry[];

  @Prop({})
  sell_price_cash: number;

  @Prop({})
  sell_price_credit: number;

  @Prop({ type: Number, default: 0 })
  thumb: number;

  @Prop({ type: [String] })
  pictures: string[];

  @Prop({ default: true })
  credit_available: boolean;

  @Prop({ default: true })
  enabled: boolean;

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
