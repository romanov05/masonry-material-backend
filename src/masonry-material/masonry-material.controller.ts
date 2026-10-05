import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MasonryMaterialService } from './masonry-material.service';
import { getMasonryMaterialCurrentUserId } from '../masonry-material-current-user';
import { MasonryMaterialUploadedFiles } from './masonry-material-uploaded-file';
import { CreateMasonryMaterialDto } from './dto/create-masonry-material.dto';
import { PublishMasonryMaterialDto } from './dto/publish-masonry-material.dto';
import { LikeMasonryMaterialDto } from './dto/like-masonry-material.dto';
import {
  MasonryMaterialFeedQueryDto,
  MasonryMaterialFiltersDto,
} from './dto/masonry-material-query.dto';

@Controller('masonry-materials')
export class MasonryMaterialController {
  constructor(private readonly masonryMaterialService: MasonryMaterialService) {}

  // GET /api/masonry-materials?maxConsumption=200
  @Get()
  getList(@Query() filters: MasonryMaterialFiltersDto) {
    return this.masonryMaterialService.getPublishedList(filters, getMasonryMaterialCurrentUserId());
  }

  // GET /api/masonry-materials/feed?id=2&next=true
  @Get('feed')
  getFeed(@Query() query: MasonryMaterialFeedQueryDto) {
    return this.masonryMaterialService.getFeedItem(query, getMasonryMaterialCurrentUserId());
  }

  // GET /api/masonry-materials/draft — id не указывается
  @Get('draft')
  getDraft() {
    return this.masonryMaterialService.getDraft(getMasonryMaterialCurrentUserId());
  }

  // POST /api/masonry-materials — form-data: name, image (файл), video (файл)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 },
      ],
      {
        limits: { fileSize: 50 * 1024 * 1024 }, // 50 МБ
        fileFilter: (_request, file, callback) => {
          const isImage =
            file.mimetype.startsWith('image/') || /\.(jpe?g|png|gif|webp)$/i.test(file.originalname);
          const isVideo =
            file.mimetype.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv)$/i.test(file.originalname);
          const isAllowed = file.fieldname === 'image' ? isImage : isVideo;

          if (!isAllowed) {
            return callback(new BadRequestException(), false);
          }
          callback(null, true);
        },
      },
    ),
  )
  create(@Body() dto: CreateMasonryMaterialDto, @UploadedFiles() files: MasonryMaterialUploadedFiles) {
    const image = files?.image?.[0];
    const video = files?.video?.[0];
    if (!image || !video) {
      throw new BadRequestException();
    }
    return this.masonryMaterialService.createDraft(getMasonryMaterialCurrentUserId(), dto, image, video);
  }

  // PUT /api/masonry-materials/:id/publish — черновик → опубликован
  @Put(':id/publish')
  publish(@Param('id', ParseIntPipe) id: number, @Body() dto: PublishMasonryMaterialDto) {
    return this.masonryMaterialService.publish(id, getMasonryMaterialCurrentUserId(), dto);
  }

  // DELETE /api/masonry-materials/:id — soft delete, ответ 200 без тела
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.masonryMaterialService.softDelete(id, getMasonryMaterialCurrentUserId());
  }

  // POST /api/masonry-materials/:id/like — { "value": 1 } или { "value": 0 }
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  setLike(@Param('id', ParseIntPipe) id: number, @Body() dto: LikeMasonryMaterialDto) {
    return this.masonryMaterialService.setLike(id, getMasonryMaterialCurrentUserId(), dto.value);
  }
}
