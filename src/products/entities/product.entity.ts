import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TPriceEntry = {
  unit_count: number;
  units_sold: number;
  amount: number;
  registeredBy: string;
  registeredOn: Date;
};

@Schema()
export class PriceEntry {
  @Prop()
  unit_count: number;

  @Prop()
  units_sold: number;

  @Prop()
  amount: number;

  @Prop()
  registeredBy: string;

  @Prop()
  registeredOn: Date;
}

const PriceEntrySchema = SchemaFactory.createForClass(PriceEntry);

export const ProductUses: { VENTA: 'sale'; INSUMO: 'supply' } = {
  VENTA: 'sale',
  INSUMO: 'supply',
};

export type ProductUse = (typeof ProductUses)[keyof typeof ProductUses];
export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({ required: true, text: true })
  name: string;

  @Prop({ type: String, index: true })
  barcode: string;

  @Prop({ maxlength: 180 })
  description: string;

  @Prop({ type: String })
  category: string;

  // @Prop({ type: Schema.Types.ObjectId, ref: 'Supplier' })
  // supplier: Supplier;

  @Prop({ type: String, enum: ['sale', 'supply'] })
  use: ProductUse;

  @Prop({ default: [], type: [PriceEntrySchema] })
  buy_prices: PriceEntry[];

  @Prop()
  buy_price: number;

  @Prop({})
  sell_price_cash: number;

  @Prop({})
  sell_price_credit: number;

  @Prop({ type: Number, default: 0 })
  thumb: number;

  @Prop({ type: [String] })
  pictures: string[];

  @Prop({ default: 1 })
  stock: number;

  @Prop({ default: true })
  credit_available: boolean;

  @Prop({ default: true })
  enabled: boolean;

  /*   // Props tentativas
  @Prop()
  last_sold: Date;

  @Prop()
  last_restock: Date;

  // TODO: This would be a ref to a User in DB
  @Prop()
  added_by: string; */
}

export const ProductSchema = SchemaFactory.createForClass(Product);
