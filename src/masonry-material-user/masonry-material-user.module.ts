import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasonryMaterialUserController } from './masonry-material-user.controller';
import { MasonryMaterialUserService } from './masonry-material-user.service';
import { MasonryMaterialUserEntity } from '../masonry-material/entities/masonry-material-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MasonryMaterialUserEntity])],
  controllers: [MasonryMaterialUserController],
  providers: [MasonryMaterialUserService],
})
export class MasonryMaterialUserModule {}
