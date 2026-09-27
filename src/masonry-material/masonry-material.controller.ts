import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Redirect,
  Render,
} from '@nestjs/common';
import { MasonryMaterialService } from './masonry-material.service';
import { MASONRY_MATERIAL_CURRENT_USER_ID } from './masonry-material.constants';

@Controller('masonry-material')
export class MasonryMaterialController {
  constructor(private readonly masonryMaterialService: MasonryMaterialService) {}

  @Get('feed')
  @Render('masonry-material-feed')
  async getFeedDefault() {
    const item = await this.masonryMaterialService.getFeedItem();
    return {
      item,
      likesCount: await this.masonryMaterialService.getLikesCount(item.id),
      activeTab: 'feed',
    };
  }

  @Get('feed/:id')
  @Render('masonry-material-feed')
  async getFeedById(@Param('id', ParseIntPipe) id: number, @Query('next') next?: string) {
    const item = await this.masonryMaterialService.getFeedItem(id, next === 'true');
    return {
      item,
      likesCount: await this.masonryMaterialService.getLikesCount(item.id),
      activeTab: 'feed',
    };
  }

  @Get('draft')
  @Render('masonry-material-draft')
  async getDraft() {
    const draft = await this.masonryMaterialService.findDraftByUser(MASONRY_MATERIAL_CURRENT_USER_ID);
    if (!draft) {
      return { mode: 'create', activeTab: 'draft' };
    }
    return { mode: 'publish', item: draft, activeTab: 'draft' };
  }

  @Get('tiles')
  @Render('masonry-material-tiles')
  async getTiles(@Query('search') search?: string) {
    const items = await this.masonryMaterialService.getPublishedList(search);
    const withLikes = await Promise.all(
      items.map(async (item) => ({
        ...item,
        likesCount: await this.masonryMaterialService.getLikesCount(item.id),
      })),
    );
    return { items: withLikes, search: search ?? '400', activeTab: 'tiles' };
  }

  @Post('draft/next')
  @Redirect('/masonry-material/draft', 302)
  async createDraft(@Body('name') name: string) {
    await this.masonryMaterialService.createDraftIfMissing(MASONRY_MATERIAL_CURRENT_USER_ID, name);
  }

  @Post('publish')
  @Redirect('/masonry-material/tiles', 302)
  async publish(
    @Body('id', ParseIntPipe) id: number,
    @Body('shortDescription') shortDescription: string,
    @Body('mortarPerM3') mortarPerM3: string,
    @Body('consumptionPerM3') consumptionPerM3: string,
  ) {
    await this.masonryMaterialService.publish(id, MASONRY_MATERIAL_CURRENT_USER_ID, {
      shortDescription,
      mortarPerM3: Number(mortarPerM3),
      consumptionPerM3: Number(consumptionPerM3),
    });
  }

  @Post('delete')
  @Redirect('/masonry-material/tiles', 302)
  async delete(@Body('id', ParseIntPipe) id: number) {
    await this.masonryMaterialService.softDeleteViaRawSql(id);
  }
}
