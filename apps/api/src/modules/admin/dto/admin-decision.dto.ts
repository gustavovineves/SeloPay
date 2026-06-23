import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { AdminDecisionType } from '@prisma/client';

export class AdminDecisionDto {
  @ApiProperty({ enum: AdminDecisionType })
  @IsEnum(AdminDecisionType)
  decision: AdminDecisionType;

  @ApiProperty({ example: 'Evidências verificadas. Liberando valor ao recebedor.', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
