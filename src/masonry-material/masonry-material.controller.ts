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
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MasonryMaterialService } from './masonry-material.service';
import { MasonryMaterialUploadedFiles } from './masonry-material-uploaded-file';
import { CreateMasonryMaterialDto } from './dto/create-masonry-material.dto';
import { PublishMasonryMaterialDto } from './dto/publish-masonry-material.dto';
import { LikeMasonryMaterialDto } from './dto/like-masonry-material.dto';
import { MasonryMaterialResponse } from './dto/masonry-material-response';
import {
  MasonryMaterialFeedQueryDto,
  MasonryMaterialFiltersDto,
} from './dto/masonry-material-query.dto';
import { MasonryMaterialPublic } from '../masonry-material-auth/masonry-material-public.decorator';
import { MasonryMaterialCurrentUser } from '../masonry-material-auth/masonry-material-current-user.decorator';
import type { MasonryMaterialSessionUser } from '../masonry-material-auth/masonry-material-session-user';

@ApiTags('Кладочные материалы')
@Controller('masonry-materials')
export class MasonryMaterialController {
  constructor(private readonly masonryMaterialService: MasonryMaterialService) {}

  // ---------- чтение: доступно гостю ----------

  // GET /api/masonry-materials?maxConsumption=200
  @MasonryMaterialPublic()
  @Get()
  @ApiOperation({ summary: 'Список опубликованных услуг с фильтром по расходу (доступно без авторизации)' })
  @ApiOkResponse({ type: MasonryMaterialResponse, isArray: true })
  @ApiBadRequestResponse({ description: 'Некорректный фильтр' })
  getList(
    @Query() filters: MasonryMaterialFiltersDto,
    @MasonryMaterialCurrentUser() user: MasonryMaterialSessionUser | null,
  ) {
    return this.masonryMaterialService.getPublishedList(filters, user?.id ?? null);
  }

  // GET /api/masonry-materials/feed?id=12&next=true
  @MasonryMaterialPublic()
  @Get('feed')
  @ApiOperation({ summary: 'Лента: одна опубликованная услуга (доступно без авторизации)' })
  @ApiOkResponse({ type: MasonryMaterialResponse })
  @ApiBadRequestResponse({ description: 'Нет id или он некорректный' })
  @ApiNotFoundResponse({ description: 'Услуга не найдена' })
  getFeed(
    @Query() query: MasonryMaterialFeedQueryDto,
    @MasonryMaterialCurrentUser() user: MasonryMaterialSessionUser | null,
  ) {
    return this.masonryMaterialService.getFeedItem(query, user?.id ?? null);
  }

  // ---------- методы создателя: только с сессией ----------

  // GET /api/masonry-materials/draft
  @Get('draft')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Черновик текущего пользователя' })
  @ApiOkResponse({ type: MasonryMaterialResponse })
  @ApiUnauthorizedResponse({ description: 'Нет сессии' })
  @ApiNotFoundResponse({ description: 'Черновика нет' })
  getDraft(@MasonryMaterialCurrentUser() user: MasonryMaterialSessionUser) {
    return this.masonryMaterialService.getDraft(user.id);
  }

  // POST /api/masonry-materials — form-data: name, image (файл), video (файл)
  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Создание черновика, создатель берётся из сессии' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'image', 'video'],
      properties: {
        name: { type: 'string', example: 'Клинкерный кирпич М400' },
        image: { type: 'string', format: 'binary' },
        video: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiCreatedResponse({ type: MasonryMaterialResponse })
  @ApiBadRequestResponse({ description: 'Нет файлов или некорректное название' })
  @ApiUnauthorizedResponse({ description: 'Нет сессии' })
  @ApiConflictResponse({ description: 'Черновик уже есть или название занято' })
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
  create(
    @Body() dto: CreateMasonryMaterialDto,
    @UploadedFiles() files: MasonryMaterialUploadedFiles,
    @MasonryMaterialCurrentUser() user: MasonryMaterialSessionUser,
  ) {
    const image = files?.image?.[0];
    const video = files?.video?.[0];
    if (!image || !video) {
      throw new BadRequestException();
    }
    return this.masonryMaterialService.createDraft(user.id, dto, image, video);
  }

  // PUT /api/masonry-materials/:id/publish — черновик → опубликован
  @Put(':id/publish')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Публикация своего черновика' })
  @ApiOkResponse({ type: MasonryMaterialResponse })
  @ApiBadRequestResponse({ description: 'Некорректные поля' })
  @ApiUnauthorizedResponse({ description: 'Нет сессии' })
  @ApiForbiddenResponse({ description: 'Услуга другого пользователя' })
  @ApiNotFoundResponse({ description: 'Услуга не найдена' })
  @ApiConflictResponse({ description: 'Услуга уже опубликована' })
  publish(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PublishMasonryMaterialDto,
    @MasonryMaterialCurrentUser() user: MasonryMaterialSessionUser,
  ) {
    return this.masonryMaterialService.publish(id, user.id, dto);
  }

  // DELETE /api/masonry-materials/:id — soft delete, ответ 200 без тела
  @Delete(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Удаление своей услуги (soft delete)' })
  @ApiOkResponse({ description: 'Удалено, тело пустое' })
  @ApiUnauthorizedResponse({ description: 'Нет сессии' })
  @ApiForbiddenResponse({ description: 'Услуга другого пользователя' })
  @ApiNotFoundResponse({ description: 'Услуга не найдена' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @MasonryMaterialCurrentUser() user: MasonryMaterialSessionUser,
  ) {
    return this.masonryMaterialService.softDelete(id, user.id);
  }

  // POST /api/masonry-materials/:id/like — { "value": 1 } или { "value": 0 }
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Поставить (1) или снять (0) лайк' })
  @ApiOkResponse({ type: MasonryMaterialResponse })
  @ApiBadRequestResponse({ description: 'value не 0 и не 1' })
  @ApiUnauthorizedResponse({ description: 'Нет сессии' })
  @ApiNotFoundResponse({ description: 'Опубликованная услуга не найдена' })
  setLike(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LikeMasonryMaterialDto,
    @MasonryMaterialCurrentUser() user: MasonryMaterialSessionUser,
  ) {
    return this.masonryMaterialService.setLike(id, user.id, dto.value);
  }
}
