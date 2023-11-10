import mongoose, { FilterQuery } from 'mongoose';
import { Sale } from 'src/sales/entities/sale.entity';
import { CustomerDocument } from './entities/customer.entity';

export type FindWithQueryOptions = {
  querySalesData?: boolean;
  customStages?: mongoose.PipelineStage[];
  customStageAddingStyle?: 'push' | 'unshift';
  lookupQuery?: FilterQuery<Sale>;
};

export type FindWithQueryResult = CustomerDocument & { sales_data?: Sale[] };
