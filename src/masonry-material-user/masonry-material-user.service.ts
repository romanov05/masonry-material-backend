import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasonryMaterialUserEntity } from '../masonry-material/entities/masonry-material-user.entity';
import {
  LoginMasonryMaterialUserDto,
  RegisterMasonryMaterialUserDto,
} from './dto/masonry-material-user-credentials.dto';
import { isMasonryMaterialUniqueViolation } from '../masonry-material-database-errors';

@Injectable()
export class MasonryMaterialUserService {
  constructor(
    @InjectRepository(MasonryMaterialUserEntity)
    private readonly userRepository: Repository<MasonryMaterialUserEntity>,
  ) {}

  async register(dto: RegisterMasonryMaterialUserDto): Promise<{ id: number; fullName: string }> {
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

  // заглушки до лабораторной №4
  login(_dto: LoginMasonryMaterialUserDto): void {}

  logout(): void {}
}
