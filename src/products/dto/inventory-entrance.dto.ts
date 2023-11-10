import { IsDate } from 'class-validator';

export class EntryProductDto {
  _id: string;
  sale_units: number;
  supply_units: number;
  cost?: number;
  sell_price_cash?: number;
  sell_price_credit?: number;
}

export class InventoryEntryDto {
  products: EntryProductDto[];

  @IsDate()
  entry_date: Date;

  recevied_by?: string;
  supplier?: string;
}

export class BulkPictureUpdateDto {
  picture: Buffer;
}
