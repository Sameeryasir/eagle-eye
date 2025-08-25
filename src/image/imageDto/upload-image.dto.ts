import { IsOptional, IsNumber } from 'class-validator';

export class UploadImageDto {
  @IsOptional()
  @IsNumber()
  logId?: number; // Optional log ID to associate the image with a specific log
}
