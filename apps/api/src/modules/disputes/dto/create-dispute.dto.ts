import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateDisputeDto {
  @ApiProperty({ example: 'cjld2cjxh0000qzrmn831i7rn' })
  @IsString()
  agreementId: string;

  @ApiProperty({ example: 'Serviço não foi entregue conforme combinado' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Combinamos a entrega até hoje, mas nada foi feito...' })
  @IsString()
  @MinLength(10)
  description: string;
}
