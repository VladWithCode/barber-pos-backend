import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const UserRoles = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];
export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  display_name: string;

  @Prop({ enum: Object.values(UserRoles), default: UserRoles.USER })
  role: UserRole;

  @Prop({ type: [Types.ObjectId], ref: 'Sale' })
  sales: [/* Here goes the Sale Class */];

  @Prop({ type: Date })
  birth_date: Date;

  @Prop({ type: String })
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
