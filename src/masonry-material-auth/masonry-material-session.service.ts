import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import {
  MASONRY_MATERIAL_SESSION_KEY_PREFIX,
  MASONRY_MATERIAL_SESSION_TTL_SECONDS,
} from './masonry-material-auth.constants';
import { MasonryMaterialSessionUser } from './masonry-material-session-user';

// сессии хранятся в Redis: ключ masonry-material-session:<id>, значение — пользователь в JSON
@Injectable()
export class MasonryMaterialSessionService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(config: ConfigService) {
    this.redis = new Redis({
      host: config.get('REDIS_HOST', 'localhost'),
      port: Number(config.get('REDIS_PORT', 6379)),
    });
  }

  // создать сессию → вернуть её id (он уйдёт в куку)
  async create(user: MasonryMaterialSessionUser): Promise<string> {
    const sessionId = randomUUID();
    await this.redis.set(
      this.key(sessionId),
      JSON.stringify({ id: user.id, fullName: user.fullName }),
      'EX',
      MASONRY_MATERIAL_SESSION_TTL_SECONDS,
    );
    return sessionId;
  }

  // найти пользователя по id сессии (null — сессии нет или истекла)
  async get(sessionId: string): Promise<MasonryMaterialSessionUser | null> {
    const value = await this.redis.get(this.key(sessionId));
    if (!value) {
      return null;
    }
    try {
      const user = JSON.parse(value) as MasonryMaterialSessionUser;
      return typeof user.id === 'number' ? user : null;
    } catch {
      return null;
    }
  }

  // удалить сессию (выход)
  async destroy(sessionId: string): Promise<void> {
    await this.redis.del(this.key(sessionId));
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  private key(sessionId: string): string {
    return `${MASONRY_MATERIAL_SESSION_KEY_PREFIX}${sessionId}`;
  }
}
