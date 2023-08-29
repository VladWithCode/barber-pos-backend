import { Injectable } from '@nestjs/common';
import { rm, writeFile } from 'fs/promises';
import * as path from 'path';

export class WritableFile {
  constructor(buffer: Buffer, filename: string) {
    this.filename = filename;
    this.buffer = buffer;
  }

  filename: string;
  buffer: Buffer;
}

@Injectable()
export class ImageService {
  constructor() {}

  async writeFile(
    file: WritableFile,
    options?: { writePath?: string; replace?: boolean },
  ) {
    const writePath =
      options?.writePath?.length > 0
        ? options.writePath
        : path.join(process.cwd(), 'public', 'images');
    await writeFile(path.join(writePath, file.filename), file.buffer);
  }

  async deleteFile(name: string, options?: { filePath: string }) {
    const filePath =
      options?.filePath?.length > 0
        ? options.filePath
        : path.join(process.cwd(), 'public', 'images', name + '.webp');

    await rm(filePath, { force: true });
  }
}
