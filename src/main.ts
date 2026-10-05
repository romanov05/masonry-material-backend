import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MasonryMaterialHttpExceptionFilter } from './masonry-material-http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // /api в начале адреса каждого метода
  app.setGlobalPrefix('api');

  // поля, которых нет в DTO (id, статус, создатель, даты), с клиента не принимаются → 400
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new MasonryMaterialHttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
  console.log('masonry-material API: http://localhost:3000/api/masonry-materials');
}
bootstrap();
