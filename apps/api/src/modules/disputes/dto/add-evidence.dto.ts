import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class AddEvidenceDto {
  @ApiProperty({ example: 'screenshot_conversa.jpg' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'image/jpeg', enum: ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'] })
  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'application/pdf', 'image/webp'])
  fileType: string;
}
