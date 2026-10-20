import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { MasonryMaterialHttpExceptionFilter } from './masonry-material-http-exception.filter';
import { MASONRY_MATERIAL_SESSION_COOKIE } from './masonry-material-auth/masonry-material-auth.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // /api в начале адреса каждого метода
  app.setGlobalPrefix('api');

  // разбор заголовка Cookie → request.cookies
  app.use(cookieParser());

  // поля, которых нет в DTO (id, статус, создатель, даты), с клиента не принимаются → 400
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new MasonryMaterialHttpExceptionFilter());

  // Swagger: http://localhost:3000/api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Masonry material API')
    .setDescription('Расчет расхода строительных материалов для кладки стен')
    .setVersion('1.0')
    .addCookieAuth(MASONRY_MATERIAL_SESSION_COOKIE)
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: { withCredentials: true }, // браузер отправляет куку сессии
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('masonry-material API: http://localhost:3000/api/masonry-materials');
  console.log('Swagger: http://localhost:3000/api/docs');
}
bootstrap();
