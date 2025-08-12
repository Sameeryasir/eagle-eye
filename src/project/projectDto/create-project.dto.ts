import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
} from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;


  @IsOptional()
  @IsInt()
  company_id ?: number;
}
