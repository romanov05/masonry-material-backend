import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min, ValidateIf } from 'class-validator';

// фильтр списка: расход не больше значения ползунка
export class MasonryMaterialFiltersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxConsumption?: number;
}

// лента: без параметров — 400; ?next=true без id — первая услуга;
// ?id= — эта услуга; ?id=&next=true — следующая по кругу
export class MasonryMaterialFeedQueryDto {
  // id проверяется, если он передан или если нет next=true (тогда отсутствие id → 400)
  @ValidateIf((query: MasonryMaterialFeedQueryDto) => query.id !== undefined || query.next !== true)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  next?: boolean;
}
