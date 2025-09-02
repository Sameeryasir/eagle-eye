import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
} from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  companyId?: number;

  // Allow updating assigned manager (must be Manager in same company)
  @IsOptional()
  @IsInt()
  assignedTo?: number;
}
