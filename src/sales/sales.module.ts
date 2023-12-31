import { Module, forwardRef } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sale, SaleSchema } from './entities/sale.entity';
import { ProductsModule } from 'src/products/products.module';
import { CustomersModule } from 'src/customers/customers.module';
import { WhatsappApiModule } from 'src/whatsapp-api/whatsapp-api.module';

@Module({
  imports: [
    forwardRef(() => ProductsModule),
    CustomersModule,
    MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]),
    WhatsappApiModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
