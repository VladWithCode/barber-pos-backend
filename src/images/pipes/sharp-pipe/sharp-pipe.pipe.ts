import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
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

@Injectable()
export class SharpPipeMultiple
  implements PipeTransform<Express.Multer.File[], Promise<Buffer[]>>
{
  async transform(images: Express.Multer.File[]): Promise<Buffer[]> {
    const sharpPromises = images.map((img) => {
      return sharp(img.buffer).resize(1200).webp({ effort: 3 }).toBuffer();
    });
    try {
      const buffers = await Promise.all(sharpPromises);

      return buffers;
    } catch (e: any) {
      console.error(e);
      throw new Error('Error al procesar las imagenes');
    }
  }
}
