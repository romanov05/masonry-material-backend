import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterMasonryMaterialUserDto {
  @ApiProperty({ example: 'Иван Петров', minLength: 3, maxLength: 100 })
  @IsString()
  @Length(3, 100)
  fullName: string;

  @ApiProperty({ example: 'secret123', minLength: 6, maxLength: 72 })
  @IsString()
  @Length(6, 72)
  password: string;
}

export class LoginMasonryMaterialUserDto {
  @ApiProperty({ example: 'Иван Петров' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

// ответ регистрации и входа
export class MasonryMaterialUserResponse {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'Иван Петров' })
  fullName: string;
}
