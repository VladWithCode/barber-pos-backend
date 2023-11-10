import { Module } from '@nestjs/common';
import { WhatsappApiService } from './whatsapp-api.service';
import { WhatsappApiController } from './whatsapp-api.controller';
import { HttpModule } from '@nestjs/axios';
import { HttpConfigService } from './http.config';
import { SalesModule } from 'src/sales/sales.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
  controllers: [WhatsappApiController],
  providers: [WhatsappApiService],
  exports: [WhatsappApiService],
})
export class WhatsappApiModule {}
