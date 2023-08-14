import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { parse, join } from 'path';
import * as sharp from 'sharp';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File[], Promise<Buffer[]>>
{
  async transform(images: Express.Multer.File[]): Promise<Buffer[]> {
    const fileBuffers = [];
    const sharpPromises = images.map((img) => {
      return sharp(img.buffer).resize(800).webp({ effort: 3 }).toBuffer();
    });

    const settledPromises = await Promise.allSettled(sharpPromises);

    for (let buf of settledPromises) {
      if (buf.status === 'fulfilled') fileBuffers.push(buf.value);
    }

    return fileBuffers;
  }
}
