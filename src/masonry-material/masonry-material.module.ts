import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasonryMaterialController } from './masonry-material.controller';
import { MasonryMaterialService } from './masonry-material.service';
import { MasonryMaterialServiceEntity } from './entities/masonry-material-service.entity';
import { MasonryMaterialUserEntity } from './entities/masonry-material-user.entity';
import { MasonryMaterialLikeEntity } from './entities/masonry-material-like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MasonryMaterialServiceEntity,
      MasonryMaterialUserEntity,
      MasonryMaterialLikeEntity,
    ]),
  ],
  controllers: [MasonryMaterialController],
  providers: [MasonryMaterialService],
})
export class MasonryMaterialModule {}
