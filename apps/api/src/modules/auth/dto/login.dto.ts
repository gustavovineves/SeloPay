import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'erika@demo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Demo@123' })
  @IsString()
  @MinLength(6)
  password: string;
}
