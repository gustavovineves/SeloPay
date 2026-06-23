import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional, Max } from 'class-validator';

export class CreditBalanceDto {
  @ApiProperty({ example: 500, description: 'Valor a depositar (simulado)' })
  @IsNumber()
  @IsPositive()
  @Max(10_000, { message: 'Depósito máximo de R$ 10.000 por vez' })
  amount: number;

  @ApiProperty({ example: 'Depósito simulado para demonstração', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
