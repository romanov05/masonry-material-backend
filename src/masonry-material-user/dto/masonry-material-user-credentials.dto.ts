import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterMasonryMaterialUserDto {
  @IsString()
  @Length(3, 100)
  fullName: string;

  @IsString()
  @Length(6, 72)
  password: string;
}

export class LoginMasonryMaterialUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
