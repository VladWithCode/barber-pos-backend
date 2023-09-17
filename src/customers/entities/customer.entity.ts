import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SocialMedia = {
  type: 'Facebook' | 'Twitter' | 'Instagram' | 'TikTok';
  username: string;
};

@Schema()
export class Customer {
  @Prop({ required: true, text: true })
  fullname: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ type: String, enum: ['Facebook', 'Twitter', 'Instagram', 'TikTok'] })
  social_media: SocialMedia;

  @Prop()
  dob: Date;
}

export type CustomerDocument = HydratedDocument<Customer>;

export const CustomerSchema = SchemaFactory.createForClass(Customer);
