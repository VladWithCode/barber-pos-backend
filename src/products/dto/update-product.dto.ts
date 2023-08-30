import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class UpdateStockDto {
  buy_price: number;
  sell_units: number;
  supply_units: number;
  
}
