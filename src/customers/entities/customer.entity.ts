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

  @Prop({ default: 0 })
  income_total: number;

  @Prop({ default: 0 })
  income_credit_purchases: number;

  @Prop({ default: 0 })
  income_cash_purchases: number;

  @Prop({ default: 0 })
  credit_purchases_count: number;

  @Prop({ default: 0 })
  cash_purchases_count: number;

  @Prop({ default: 0 })
  pending_payment_amount: number;

  @Prop({ default: 0 })
  active_credit_purchases_count: number;

  @Prop({ default: 500 })
  credit_score: number;

  @Prop({ default: false })
  has_overdue_credits: boolean;

  @Prop({ default: 0 })
  accumulated_interest: number;

  @Prop()
  requires_contact: boolean;

  @Prop({ type: [String], default: [] })
  sales: string[];
}

export type CustomerDocument = HydratedDocument<Customer>;

export const CustomerSchema = SchemaFactory.createForClass(Customer);
