import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { MasonryMaterialUserService } from './masonry-material-user.service';
import {
  LoginMasonryMaterialUserDto,
  MasonryMaterialUserResponse,
  RegisterMasonryMaterialUserDto,
} from './dto/masonry-material-user-credentials.dto';
import { MasonryMaterialPublic } from '../masonry-material-auth/masonry-material-public.decorator';
import { MasonryMaterialRequest } from '../masonry-material-auth/masonry-material-session-user';
import {
  MASONRY_MATERIAL_SESSION_COOKIE,
  MASONRY_MATERIAL_SESSION_COOKIE_OPTIONS,
} from '../masonry-material-auth/masonry-material-auth.constants';

@ApiTags('Пользователи')
@Controller('users')
export class MasonryMaterialUserController {
  constructor(private readonly masonryMaterialUserService: MasonryMaterialUserService) {}

  // POST /api/users/register
  @MasonryMaterialPublic()
  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiCreatedResponse({ type: MasonryMaterialUserResponse })
  @ApiBadRequestResponse({ description: 'Некорректные поля' })
  @ApiConflictResponse({ description: 'Пользователь с таким именем уже есть' })
  register(@Body() dto: RegisterMasonryMaterialUserDto) {
    return this.masonryMaterialUserService.register(dto);
  }

  // POST /api/users/login — создаёт сессию в Redis и ставит куку
  @MasonryMaterialPublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Аутентификация: создаёт сессию и ставит куку masonry-material-session-id' })
  @ApiOkResponse({ type: MasonryMaterialUserResponse })
  @ApiBadRequestResponse({ description: 'Некорректные поля' })
  @ApiUnauthorizedResponse({ description: 'Неверное имя или пароль' })
  async login(
    @Body() dto: LoginMasonryMaterialUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { sessionId, user } = await this.masonryMaterialUserService.login(dto);
    response.cookie(MASONRY_MATERIAL_SESSION_COOKIE, sessionId, MASONRY_MATERIAL_SESSION_COOKIE_OPTIONS);
    return user;
  }

  // POST /api/users/logout — удаляет сессию из Redis и куку
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Выход: удаляет сессию и куку' })
  @ApiOkResponse({ description: 'Сессия удалена, тело пустое' })
  @ApiUnauthorizedResponse({ description: 'Нет сессии' })
  async logout(
    @Req() request: MasonryMaterialRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.masonryMaterialUserService.logout(request.cookies?.[MASONRY_MATERIAL_SESSION_COOKIE]);
    response.clearCookie(MASONRY_MATERIAL_SESSION_COOKIE, { path: '/' });
  }
}
