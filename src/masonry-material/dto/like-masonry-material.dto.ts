import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn } from 'class-validator';

// 1 — поставить лайк, 0 — отменить
export class LikeMasonryMaterialDto {
  @ApiProperty({ enum: [0, 1], example: 1, description: '1 — поставить лайк, 0 — отменить' })
  @Type(() => Number)
  @IsIn([0, 1])
  value: 0 | 1;
}
