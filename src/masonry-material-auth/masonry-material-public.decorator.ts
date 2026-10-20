import { SetMetadata } from '@nestjs/common';

export const MASONRY_MATERIAL_PUBLIC_KEY = 'masonry-material-public';

// метод доступен гостю (без куки сессии)
export const MasonryMaterialPublic = () => SetMetadata(MASONRY_MATERIAL_PUBLIC_KEY, true);
