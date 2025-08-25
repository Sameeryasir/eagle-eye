import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateLogDto {
  @IsString()
  @IsNotEmpty()
  Note?: string;


}
