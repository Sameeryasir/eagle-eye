import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateLogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;


}
