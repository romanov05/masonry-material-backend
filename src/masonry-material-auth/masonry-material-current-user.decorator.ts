import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { MasonryMaterialRequest, MasonryMaterialSessionUser } from './masonry-material-session-user';

// текущий пользователь из сессии; для гостя — null
export const MasonryMaterialCurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): MasonryMaterialSessionUser | null => {
    const request = context.switchToHttp().getRequest<MasonryMaterialRequest>();
    return request.masonryMaterialUser ?? null;
  },
);
