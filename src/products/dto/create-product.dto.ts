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
  @IsOptional()
  _id?: string;

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

  @IsNumber()
  cost: number;

  @IsNumber()
  sell_price_cash: number;

  @IsNumber()
  sell_price_credit: number;

  @IsNumber()
  sale_units: number;

  @IsNumber()
  supply_units: number;

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
