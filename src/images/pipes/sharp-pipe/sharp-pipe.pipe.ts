import { Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<Buffer>>
{
  async transform(image: Express.Multer.File): Promise<Buffer> {
    return await sharp(image.buffer)
      .resize(1200)
      .webp({ effort: 3 })
      .toBuffer();
  }
}
