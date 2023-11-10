import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  ItemExistance,
  ItemExistanceTypes,
} from '../entities/order-item.entity';
import { ProductUse, ProductUses } from 'src/products/entities/product.entity';

export class CreateOrderItemDto {
  @IsIn(Object.values(ItemExistanceTypes), {
    message:
      'Valor de existencia incorrecto. Debe ser ' +
      ItemExistanceTypes.EXISTING +
      ' o ' +
      ItemExistanceTypes.NEW,
  })
  existance_type: ItemExistance;

  @ValidateIf((o) => o.existance_type === ItemExistanceTypes.NEW)
  @IsString({
    message: 'El nombre de producto es obligatorio para los productos nuevos',
  })
  @MinLength(5, {
    message: 'El nombre del producto debe ser de minimo 5 caracteres de largo',
  })
  @MaxLength(20, {
    message: 'El nombre del producto debe ser de maximo 20 caracteres de largo',
  })
  name?: string;

  @ValidateIf((o) => o.existance_type === ItemExistanceTypes.EXISTING)
  @IsString({
    message: 'El id del producto es obligatorio para los productos existentes',
  })
  product_id: string;

  @IsOptional()
  @IsNumber({}, { message: 'El costo debe ser un numero mayor a 0' })
  cost: number;

  @ValidateIf((o) => o.existance_type === ItemExistanceTypes.NEW, {
    message: 'El precio de contado es obligatorio para los productos nuevos',
  })
  @IsNumber(
    {},
    { message: 'El precio de contado debe ser un numero mayor a 0' },
  )
  cash_price: number;

  @ValidateIf((o) => o.existance_type === ItemExistanceTypes.NEW, {
    message: 'El precio de credito es obligatorio para los productos nuevos',
  })
  @IsNumber(
    {},
    { message: 'El precio de credito debe ser un numero mayor a 0' },
  )
  credit_price: number;

  @IsNumber({}, { message: 'El numero total de unidades debe ser mayor a 0' })
  @Min(1)
  units: number;

  @IsOptional()
  @IsNumber()
  supply_units: number;

  /**
   *  Both category & subcategory are only
   * required when the product is new and will be
   * created in DB
   */
  @ValidateIf((o) => o.existance_type === ItemExistanceTypes.NEW, {
    message: 'La categoria es obligatoria para los productos nuevos',
  })
  @IsString()
  category: string;

  @ValidateIf((o) => o.existance_type === ItemExistanceTypes.NEW, {
    message: 'La subcategoria es obligatoria para los productos nuevos',
  })
  @IsString()
  subcategory: string;
}

export class CreateOrderDto {
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'La fecha de solicitud no es valida' })
  request_date?: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'La fecha de entrada es requerida' })
  arrival_date: Date;

  @IsArray({ message: 'Los productos/perfumes ingresados no son validos' })
  @ValidateNested({
    each: true,
    message: 'Los productos/perfumes ingresados no son validos',
  })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
