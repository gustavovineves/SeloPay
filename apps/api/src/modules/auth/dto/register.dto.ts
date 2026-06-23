import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Érika Souza' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '111.222.333-44' })
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF deve estar no formato 000.000.000-00',
  })
  cpf: string;

  @ApiProperty({ example: 'erika@demo.com' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({ example: 'Demo@123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter ao menos 6 caracteres' })
  password: string;
}
