import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MasonryMaterialUserService } from './masonry-material-user.service';
import {
  LoginMasonryMaterialUserDto,
  RegisterMasonryMaterialUserDto,
} from './dto/masonry-material-user-credentials.dto';

@Controller('users')
export class MasonryMaterialUserController {
  constructor(private readonly masonryMaterialUserService: MasonryMaterialUserService) {}

  // POST /api/users/register — 201 { id, fullName }
  @Post('register')
  register(@Body() dto: RegisterMasonryMaterialUserDto) {
    return this.masonryMaterialUserService.register(dto);
  }

  // POST /api/users/login — заглушка, 200 без тела
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginMasonryMaterialUserDto) {
    return this.masonryMaterialUserService.login(dto);
  }

  // POST /api/users/logout — заглушка, 200 без тела
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return this.masonryMaterialUserService.logout();
  }
}
