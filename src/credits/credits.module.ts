import { Module, forwardRef } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreditsController } from './credits.controller';
import { SalesModule } from 'src/sales/sales.module';
import { CustomersModule } from 'src/customers/customers.module';

@Module({
  imports: [forwardRef(() => CustomersModule), forwardRef(() => SalesModule)],
  controllers: [CreditsController],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
