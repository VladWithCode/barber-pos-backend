import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ProductUse } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  category?: string;
  // use: ProductUse;

  @IsNumber()
  @Min(1)
  buy_price: number;

  @IsOptional()
  @IsNumber()
  sell_price_cash: number;

  @IsOptional()
  @IsNumber()
  sell_price_credit: number;

  @IsNumber()
  thumb?: number;

  @IsArray()
  @IsString({ each: true })
  pictures?: string[];
  stock?: number;
  credit_available?: boolean;
  enabled?: boolean;
  amount_sale?: number;
  amount_supply?: number;
}

export type TCreateProductData = CreateProductDto & {
  use: ProductUse;
};
