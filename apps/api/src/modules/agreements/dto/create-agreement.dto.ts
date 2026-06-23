import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNumber,
  IsPositive,
  IsDateString,
  Min,
} from 'class-validator';
import { AgreementType } from '@prisma/client';

export class CreateAgreementDto {
  @ApiProperty({ enum: AgreementType, example: 'GUARANTEED' })
  @IsEnum(AgreementType)
  type: AgreementType;

  @ApiProperty({ example: '@carlos456', description: 'Chave SeloPay do recebedor' })
  @IsString()
  receiverSeloKey: string;

  @ApiProperty({ example: 250, description: 'Valor combinado em R$' })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @ApiProperty({ example: '2026-06-14T23:59:00.000Z' })
  @IsDateString()
  dueDate: string;
}
