import { Type } from 'class-transformer';
import { IsIn } from 'class-validator';

// 1 — поставить лайк, 0 — отменить
export class LikeMasonryMaterialDto {
  @Type(() => Number)
  @IsIn([0, 1])
  value: 0 | 1;
}
