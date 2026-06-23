import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const LOCAL_MARKER = '/uploads/';

// Stores uploaded images and returns a public URL. Uses S3 when configured
// (AWS_S3_BUCKET + AWS_REGION); otherwise falls back to local disk served at
// /uploads so the onboarding flow works in development without AWS.
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket?: string;
  private readonly region?: string;
  private readonly s3?: S3Client;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('AWS_S3_BUCKET');
    this.region = this.config.get<string>('AWS_REGION');
    if (this.bucket && this.region) {
      this.s3 = new S3Client({ region: this.region });
    } else {
      this.logger.warn(
        '[storage] S3 not configured; images are saved to local disk (/uploads).',
      );
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const key = `profiles/${randomUUID()}${this.extensionFor(file)}`;
    return this.s3 ? this.uploadToS3(key, file) : this.saveToDisk(key, file);
  }

  private async uploadToS3(
    key: string,
    file: Express.Multer.File,
  ): Promise<string> {
    await this.s3!.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  private async saveToDisk(
    key: string,
    file: Express.Multer.File,
  ): Promise<string> {
    // uploadsDir mirrors the static mount in main.ts (useStaticAssets '/uploads').
    const absolutePath = join(process.cwd(), 'uploads', key);
    await mkdir(join(absolutePath, '..'), { recursive: true });
    await writeFile(absolutePath, file.buffer);

    const base =
      this.config.get<string>('BACKEND_PUBLIC_URL') ?? 'http://localhost:3001';
    return `${base}/uploads/${key}`;
  }

  // Best-effort removal of a stored image by its public URL. Failures (missing
  // file, S3 error) are logged, not thrown: the DB is already the source of
  // truth and a leftover file must never fail a profile save.
  async deleteImage(url: string): Promise<void> {
    try {
      const localIndex = url.indexOf(LOCAL_MARKER);
      if (localIndex !== -1) {
        const key = url.slice(localIndex + LOCAL_MARKER.length);
        await unlink(join(process.cwd(), 'uploads', key));
        return;
      }
      if (this.s3 && this.bucket) {
        const key = new URL(url).pathname.replace(/^\//, '');
        await this.s3.send(
          new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
        );
      }
    } catch (error) {
      this.logger.warn(`[storage] could not delete ${url}: ${String(error)}`);
    }
  }

  private extensionFor(file: Express.Multer.File): string {
    const fromName = extname(file.originalname);
    if (fromName) return fromName;
    // Fall back to the mimetype subtype (image/png -> .png).
    const subtype = file.mimetype.split('/')[1];
    return subtype ? `.${subtype}` : '';
  }
}
