import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappApiController } from './whatsapp-api.controller';
import { WhatsappApiService } from './whatsapp-api.service';

describe('WhatsappApiController', () => {
  let controller: WhatsappApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsappApiController],
      providers: [WhatsappApiService],
    }).compile();

    controller = module.get<WhatsappApiController>(WhatsappApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
