import { Module } from '@nestjs/common';
import { MasonryMaterialController } from './masonry-material.controller.js';
import { MasonryMaterialService } from './masonry-material.service.js';

@Module({
  controllers: [MasonryMaterialController],
  providers: [MasonryMaterialService]
})
export class MasonryMaterialModule {}
