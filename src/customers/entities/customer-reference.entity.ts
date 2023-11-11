import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CustomerReference {
  @Prop()
  fullname: string;

  @Prop()
  phone: string;
}

export const CustomerReferenceSchema =
  SchemaFactory.createForClass(CustomerReference);
