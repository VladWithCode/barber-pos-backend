import { Prop, Schema } from '@nestjs/mongoose';

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

export const ProductUses = {
  VENTA: 'sale',
  INSUMO: 'supplies',
};

export type ProductUse = keyof typeof ProductUses;

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

  @Prop({ type: String, enum: ['sale', 'supplies'] })
  use: ProductUse;

  @Prop({ default: [], type: [PriceEntry] })
  buy_prices: PriceEntry[];

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
  financed: boolean;

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
