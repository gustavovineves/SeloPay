import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class NegotiateDto {
  @ApiProperty({ example: '2026-06-21T23:59:00.000Z', description: 'Nova data proposta' })
  @IsDateString()
  proposedDueDate: string;
}
