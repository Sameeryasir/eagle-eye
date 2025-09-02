import { IsOptional, IsString, IsNumber } from 'class-validator';

/**
 * DTO for image upload request body (for additional metadata)
 */
export class UploadImageDto {
  @IsOptional()
  @IsNumber()
  logId?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
