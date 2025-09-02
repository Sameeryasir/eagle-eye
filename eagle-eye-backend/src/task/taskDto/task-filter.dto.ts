import { IsOptional, IsDateString, IsBooleanString } from 'class-validator';

export class TaskFilterDto {
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @IsOptional()
  @IsDateString()
  startFrom?: string;

  @IsOptional()
  @IsDateString()
  startTo?: string;

  @IsOptional()
  @IsDateString()
  endFrom?: string;

  @IsOptional()
  @IsDateString()
  endTo?: string;

  // Accepts 'true'/'false' in querystring
  @IsOptional()
  @IsBooleanString()
  upcoming?: string;
}


