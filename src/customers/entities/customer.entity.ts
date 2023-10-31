import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SocialMedia = 'Facebook' | 'Twitter' | 'Instagram' | 'TikTok';

@Schema()
export class Customer {
  @Prop({ required: true, text: true })
  fullname: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({
    type: String,
    enum: ['facebook', 'twitter', 'instagram', 'tiktok', ''],
  })
  social_media: SocialMedia;

  @Prop()
  social_media_name: string;

  @Prop()
  dob: Date;

  @Prop()
  address: string;

  @Prop()
  active: string;

  @Prop({ default: 0 })
  active_credits: number;

  @Prop({ default: 0 })
  pending_payments_amount: number;

  @Prop()
  sales: string[];
}

export type CustomerDocument = HydratedDocument<Customer>;

export const CustomerSchema = SchemaFactory.createForClass(Customer);
