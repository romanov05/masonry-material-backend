import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MASONRY_MATERIAL_SESSION_COOKIE } from './masonry-material-auth.constants';
import { MASONRY_MATERIAL_PUBLIC_KEY } from './masonry-material-public.decorator';
import { MasonryMaterialSessionService } from './masonry-material-session.service';
import { MasonryMaterialRequest } from './masonry-material-session-user';

// глобальный guard: по куке находит сессию в Redis и прикрепляет пользователя к запросу.
// Методы с @MasonryMaterialPublic() доступны всем, остальные — только с сессией, иначе 401.
@Injectable()
export class MasonryMaterialAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionService: MasonryMaterialSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<MasonryMaterialRequest>();
    const sessionId: string | undefined = request.cookies?.[MASONRY_MATERIAL_SESSION_COOKIE];
    request.masonryMaterialUser = sessionId ? await this.sessionService.get(sessionId) : null;

    const isPublic = this.reflector.getAllAndOverride<boolean>(MASONRY_MATERIAL_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    if (!request.masonryMaterialUser) {
      throw new UnauthorizedException(); // 401 — гость
    }
    return true;
  }
}
