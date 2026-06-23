import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ConfirmationType } from '@prisma/client';

export class ConfirmAgreementDto {
  @ApiProperty({
    enum: ConfirmationType,
    description:
      'Pagador: OBLIGATION_FULFILLED | Recebedor: READY_TO_RECEIVE',
  })
  @IsEnum(ConfirmationType)
  confirmationType: ConfirmationType;
}
