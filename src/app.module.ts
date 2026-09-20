import { Module } from '@nestjs/common';
import { MasonryMaterialModule } from './masonry-material/masonry-material.module';

@Module({
  imports: [MasonryMaterialModule],
})
export class AppModule {}
