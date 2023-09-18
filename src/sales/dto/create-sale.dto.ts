import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  TPaymentMethod,
  TPaymentType,
  PaymentTypes,
} from '../entities/sale.entity';

export type CreateSaleItem = {
  product: string;
  quantity: number;
  stock_entry_id: string;
  sale_price: number;
};

export class CreateSaleDto {
  @IsArray()
  items: CreateSaleItem[];

  customer?: string;

  @IsString()
  payment_type: TPaymentType;

  @IsNumber()
  deposit: number;

  deposit_date: Date;

  payment_method: TPaymentMethod;

  @IsString()
  seller: string;

  @IsOptional()
  @IsNumber()
  installment?: number;

  @IsOptional()
  next_payment_date?: Date;

  @IsOptional()
  @IsNumber()
  commision?: number;

  @IsOptional()
  credit_start_date?: Date;

  @IsOptional()
  credit_end_date?: Date;
}

export type CreditSaleDto = CreateSaleDto & {
  payment_type: typeof PaymentTypes.CREDITO;

  credit_start_date: Date;
  credit_end_date: Date;
};
