import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

// фильтр списка: расход не больше значения ползунка
export class MasonryMaterialFiltersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxConsumption?: number;
}

// лента: id обязателен (без параметров — 400); с id — эта услуга, с id и next=true — следующая
export class MasonryMaterialFeedQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  next?: boolean;
}
