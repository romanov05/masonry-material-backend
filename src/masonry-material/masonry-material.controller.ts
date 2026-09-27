import { Controller, Get, Param, ParseIntPipe, Query, Render } from '@nestjs/common';
import { MasonryMaterialService } from './masonry-material.service';

@Controller('masonry-material')
export class MasonryMaterialController {
  constructor(private readonly masonryMaterialService: MasonryMaterialService) {}

  @Get('feed')
  @Render('masonry-material-feed')
  getFeedDefault() {
    const item = this.masonryMaterialService.getFeedItem();
    return {
      item,
      likesCount: this.masonryMaterialService.getLikesCount(item),
      activeTab: 'feed',
    };
  }

  @Get('feed/:id')
  @Render('masonry-material-feed')
  getFeedById(@Param('id', ParseIntPipe) id: number, @Query('next') next?: string) {
    const item = this.masonryMaterialService.getFeedItem(id, next === 'true');
    return {
      item,
      likesCount: this.masonryMaterialService.getLikesCount(item),
      activeTab: 'feed',
    };
  }

  @Get('draft')
  @Render('masonry-material-draft')
  getDraft() {
    const item = this.masonryMaterialService.getDraft();
    return { item, activeTab: 'draft' };
  }

  @Get('tiles')
  @Render('masonry-material-tiles')
  getTiles(@Query('search') search?: string) {
    const items = this.masonryMaterialService.getPublishedList(search).map((item) => ({
      ...item,
      likesCount: this.masonryMaterialService.getLikesCount(item),
    }));
    return { items, search: search ?? '400', activeTab: 'tiles' };
  }
}
