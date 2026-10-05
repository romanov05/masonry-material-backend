import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsString, Length, Max, Min } from 'class-validator';

export class PublishMasonryMaterialDto {
  @IsString()
  @Length(10, 2000)
  shortDescription: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(999.999)
  mortarPerM3: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  consumptionPerM3: number;
}
