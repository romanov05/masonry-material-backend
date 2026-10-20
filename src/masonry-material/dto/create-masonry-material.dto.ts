import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateMasonryMaterialDto {
  @ApiProperty({ example: 'Клинкерный кирпич М400', minLength: 3, maxLength: 150 })
  @IsString()
  @Length(3, 150)
  name: string;
}
