import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasonryMaterialUserEntity } from '../masonry-material/entities/masonry-material-user.entity';
import {
  LoginMasonryMaterialUserDto,
  MasonryMaterialUserResponse,
  RegisterMasonryMaterialUserDto,
} from './dto/masonry-material-user-credentials.dto';
import { isMasonryMaterialUniqueViolation } from '../masonry-material-database-errors';
import { MasonryMaterialSessionService } from '../masonry-material-auth/masonry-material-session.service';

@Injectable()
export class MasonryMaterialUserService {
  constructor(
    @InjectRepository(MasonryMaterialUserEntity)
    private readonly userRepository: Repository<MasonryMaterialUserEntity>,
    private readonly sessionService: MasonryMaterialSessionService,
  ) {}

  // регистрация
  async register(dto: RegisterMasonryMaterialUserDto): Promise<MasonryMaterialUserResponse> {
    try {
      const saved = await this.userRepository.save(
        this.userRepository.create({ fullName: dto.fullName.trim(), password: dto.password }),
      );
      return { id: saved.id, fullName: saved.fullName };
    } catch (error) {
      if (isMasonryMaterialUniqueViolation(error)) {
        throw new ConflictException(); // пользователь с таким именем уже есть
      }
      throw error;
    }
  }

  // аутентификация: проверка имени и пароля → новая сессия в Redis
  async login(
    dto: LoginMasonryMaterialUserDto,
  ): Promise<{ sessionId: string; user: MasonryMaterialUserResponse }> {
    const user = await this.userRepository.findOne({
      where: { fullName: dto.fullName.trim() },
      select: { id: true, fullName: true, password: true }, // password по умолчанию не выбирается
    });
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException(); // 401 — неверное имя или пароль
    }

    const sessionUser = { id: user.id, fullName: user.fullName };
    const sessionId = await this.sessionService.create(sessionUser);
    return { sessionId, user: sessionUser };
  }

  // выход: удалить сессию из Redis
  async logout(sessionId: string | undefined): Promise<void> {
    if (sessionId) {
      await this.sessionService.destroy(sessionId);
    }
  }
}
