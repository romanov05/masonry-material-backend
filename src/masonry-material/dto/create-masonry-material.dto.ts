import { IsString, Length } from 'class-validator';

export class CreateMasonryMaterialDto {
  @IsString()
  @Length(3, 150)
  name: string;
}
