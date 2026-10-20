import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MasonryMaterialSessionService } from './masonry-material-session.service';
import { MasonryMaterialAuthGuard } from './masonry-material-auth.guard';

@Global()
@Module({
  providers: [
    MasonryMaterialSessionService,
    { provide: APP_GUARD, useClass: MasonryMaterialAuthGuard }, // guard на все методы
  ],
  exports: [MasonryMaterialSessionService],
})
export class MasonryMaterialAuthModule {}
