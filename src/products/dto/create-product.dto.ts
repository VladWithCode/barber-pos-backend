import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

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

  @IsString()
  category?: string;
  // use: ProductUse;

  @IsNumber()
  buy_price: number;

  @IsNumber()
  sell_price_cash: number;

  @IsNumber()
  sell_price_credit: number;

  @IsNumber()
  sale_units: number;

  @IsNumber()
  supply_units: number;

  @IsOptional()
  @IsNumber()
  thumb?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pictures?: string[];

  @IsOptional()
  @IsBoolean()
  credit_available?: boolean;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsDateString()
  register_date: Date;
}
