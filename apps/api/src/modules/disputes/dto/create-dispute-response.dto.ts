import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ResponseAttachmentDto {
  @ApiProperty({ example: 'comprovante_pagamento.jpg' })
  @IsString()
  fileName: string;

  @ApiProperty({
    example: 'image/jpeg',
    enum: ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'],
  })
  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'application/pdf', 'image/webp'])
  fileType: string;
}

export class CreateDisputeResponseDto {
  @ApiProperty({ example: 'Realizei o pagamento conforme combinado...' })
  @IsString()
  @MinLength(10)
  message: string;

  @ApiPropertyOptional({ type: [ResponseAttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseAttachmentDto)
  attachments?: ResponseAttachmentDto[];
}
