import 'dotenv/config';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serves locally-stored profile photos when S3 isn't configured (dev fallback).
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Explicit origin + credentials are required for the auth cookie to round-trip.
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
