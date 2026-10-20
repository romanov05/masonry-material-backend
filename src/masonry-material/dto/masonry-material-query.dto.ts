import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

// фильтр списка: расход не больше значения ползунка
export class MasonryMaterialFiltersDto {
  @ApiPropertyOptional({ example: 200, description: 'Максимальный расход, шт./м³' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxConsumption?: number;
}

// лента: id обязателен (без параметров — 400); с id — эта услуга, с id и next=true — следующая
export class MasonryMaterialFeedQueryDto {
  @ApiProperty({ example: 12, description: 'id текущей услуги' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;

  @ApiPropertyOptional({ example: true, description: 'true — следующая услуга по кругу' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  next?: boolean;
}
