import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min, ValidateIf } from 'class-validator';

// фильтр списка: расход не больше значения ползунка
export class MasonryMaterialFiltersDto {
  @ApiPropertyOptional({ example: 200, description: 'Максимальный расход, шт./м³' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxConsumption?: number;
}

// лента: без параметров — 400; ?next=true без id — первая услуга;
// ?id= — эта услуга; ?id=&next=true — следующая по кругу
export class MasonryMaterialFeedQueryDto {
  @ApiPropertyOptional({ example: 12, description: 'id текущей услуги; можно не указывать только вместе с next=true' })
  // id проверяется, если он передан или если нет next=true (тогда отсутствие id → 400)
  @ValidateIf((query: MasonryMaterialFeedQueryDto) => query.id !== undefined || query.next !== true)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;

  @ApiPropertyOptional({ example: true, description: 'true — следующая услуга по кругу; без id — первая' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  next?: boolean;
}
