import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Max } from 'class-validator';

export class CreatePixDepositDto {
  @ApiProperty({ example: 100, description: 'Valor do depósito via Pix' })
  @IsNumber()
  @IsPositive()
  @Max(10_000, { message: 'Depósito máximo de R$ 10.000 por vez' })
  amount: number;
}
