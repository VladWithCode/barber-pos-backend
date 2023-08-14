import { Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';
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

  async writeFiles(
    files: WritableFile[],
    options?: { writePath?: string; replace?: boolean },
  ) {
    const writePath =
      options.writePath?.length > 0
        ? options.writePath
        : path.join(process.cwd(), 'public/images');

    const writePromises = files.map((f) => {
      return writeFile(path.join(writePath, f.filename), f.buffer);
    });

    await Promise.allSettled(writePromises);
  }
}
