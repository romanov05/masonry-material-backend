import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { MasonryMaterialUploadedFile } from './masonry-material-uploaded-file';

export type MasonryMaterialFileKind = 'image' | 'video';

@Injectable()
export class MasonryMaterialMinioService implements OnModuleInit {
  private readonly logger = new Logger(MasonryMaterialMinioService.name);
  private readonly client: Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(config: ConfigService) {
    const endPoint = config.getOrThrow<string>('MINIO_ENDPOINT');
    const port = Number(config.getOrThrow<string>('MINIO_PORT'));
    const useSSL = config.get<string>('MINIO_USE_SSL') === 'true';

    this.bucket = config.getOrThrow<string>('MINIO_BUCKET');
    this.client = new Client({
      endPoint,
      port,
      useSSL,
      accessKey: config.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: config.getOrThrow<string>('MINIO_SECRET_KEY'),
    });
    this.publicBaseUrl = `${useSSL ? 'https' : 'http'}://${endPoint}:${port}/${this.bucket}`;
  }

  async onModuleInit(): Promise<void> {
    try {
      if (!(await this.client.bucketExists(this.bucket))) {
        await this.client.makeBucket(this.bucket);
      }
      const publicReadPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      };
      await this.client.setBucketPolicy(this.bucket, JSON.stringify(publicReadPolicy));
    } catch (error) {
      this.logger.error(error);
    }
  }

  async uploadFile(file: MasonryMaterialUploadedFile, kind: MasonryMaterialFileKind): Promise<string> {
    const extension =
      extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '') ||
      (kind === 'image' ? '.jpg' : '.mp4');
    const fileName = `masonry-material-${kind}-${randomUUID()}${extension}`;

    const contentTypesByExtension: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.webm': 'video/webm',
    };
    const contentType =
      file.mimetype && file.mimetype !== 'application/octet-stream'
        ? file.mimetype
        : (contentTypesByExtension[extension] ?? 'application/octet-stream');

    await this.client.putObject(this.bucket, fileName, file.buffer, file.size, {
      'Content-Type': contentType,
    });
    return fileName;
  }

  async removeFile(fileName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, fileName);
    } catch (error) {
      this.logger.warn(error);
    }
  }

  getPublicUrl(storedValue: string): string {
    if (/^https?:\/\//.test(storedValue)) {
      return storedValue;
    }
    const fileName = storedValue.split('/').pop() ?? storedValue;
    return `${this.publicBaseUrl}/${encodeURIComponent(fileName)}`;
  }
}
