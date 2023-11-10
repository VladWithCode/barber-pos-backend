import { HttpModuleOptionsFactory } from '@nestjs/axios';
import { HttpModuleOptions } from '@nestjs/axios/dist';

export class HttpConfigService implements HttpModuleOptionsFactory {
  createHttpOptions(): HttpModuleOptions {
    return {
      headers: {
        Authorization: 'Bearer ' + process.env.WHATSAPP_CLOUD_API_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      baseURL: process.env.WHATSAPP_CLOUD_API_BASE_URL,
    };
  }
}
