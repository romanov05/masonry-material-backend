import type { Request } from 'express';

// пользователь, который хранится в сессии Redis
export interface MasonryMaterialSessionUser {
  id: number;
  fullName: string;
}

// запрос, к которому guard прикрепил пользователя из сессии (null — гость)
export interface MasonryMaterialRequest extends Request {
  masonryMaterialUser?: MasonryMaterialSessionUser | null;
}
