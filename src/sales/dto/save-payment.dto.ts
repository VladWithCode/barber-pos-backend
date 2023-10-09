import { TPaymentMethod } from '../entities/sale.entity';

export class SavePaymentDto {
  amount: number;
  method: TPaymentMethod;
  received_by: string;

  date?: Date;
}
