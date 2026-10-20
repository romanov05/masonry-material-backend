import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsString, Length, Max, Min } from 'class-validator';

export class PublishMasonryMaterialDto {
  @ApiProperty({ example: 'Облицовочный клинкерный кирпич для наружных стен', minLength: 10, maxLength: 2000 })
  @IsString()
  @Length(10, 2000)
  shortDescription: string;

  @ApiProperty({ example: 0.23, description: 'Раствор на 1 м³ кладки, м³', minimum: 0.001, maximum: 999.999 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(999.999)
  mortarPerM3: number;

  @ApiProperty({ example: 394, description: 'Расход, шт./м³', minimum: 1, maximum: 100000 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  consumptionPerM3: number;
}
