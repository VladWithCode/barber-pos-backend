import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class BulkUploadPipe
  implements PipeTransform<Express.Multer.File, Promise<any>>
{
  async transform(value: Express.Multer.File) {
    return JSON.parse(value.buffer.toString());
  }
}
