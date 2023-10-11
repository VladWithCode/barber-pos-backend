import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type SubcategoryDoc = HydratedDocument<Subcategory>;

@Schema()
export class Subcategory {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Category', required: true })
  category: string;
}

export const SubcategorySchema = SchemaFactory.createForClass(Subcategory);
