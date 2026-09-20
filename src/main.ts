import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

const hbs = require('hbs');

const MINIO_PUBLIC_URL = 'http://localhost:9000';
const MINIO_BUCKET = 'masonry-material-media';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await new Promise<void>((resolve) => {
    hbs.registerPartials(join(__dirname, '..', 'views', 'partials'), () => resolve());
  });

  hbs.registerHelper('mediaUrl', (key: string) => `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${key}`);
  hbs.registerHelper('eq', (a: unknown, b: unknown) => a === b);

  await app.listen(process.env.PORT ?? 3000);
  console.log('masonry-material-app запущено на http://localhost:3000/masonry-material/tiles');
}
bootstrap();
