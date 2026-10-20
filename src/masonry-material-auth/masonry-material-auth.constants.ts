import type { CookieOptions } from 'express';

// имя куки, в которой браузер хранит id сессии
export const MASONRY_MATERIAL_SESSION_COOKIE = 'masonry-material-session-id';

// префикс ключа сессии в Redis: masonry-material-session:<id сессии>
export const MASONRY_MATERIAL_SESSION_KEY_PREFIX = 'masonry-material-session:';

// время жизни сессии — 1 час
export const MASONRY_MATERIAL_SESSION_TTL_SECONDS = 60 * 60;

export const MASONRY_MATERIAL_SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true, // куку не прочитать из JavaScript
  sameSite: 'lax',
  path: '/',
  maxAge: MASONRY_MATERIAL_SESSION_TTL_SECONDS * 1000,
};
