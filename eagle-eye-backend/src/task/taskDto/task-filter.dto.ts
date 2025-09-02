

import { IsOptional, IsIn, IsNotEmpty, IsNumber, IsDateString, Min, IsBoolean, IsEmail } from 'class-validator';


export class TaskFilterDto {
  @IsNumber()
  @IsNotEmpty()
  projectId: number;

  @IsOptional()
  @IsIn(['createdAt', 'startTime','endTime'])
  sortBy?: 'createdAt' | 'startTime'|'endTime';

  
  @IsOptional()
  @IsIn(['me'])
  assignedTo?: 'me';

  // --- Email Filter ---
  // When provided, filters tasks by the assigned user's email address.
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;


  @IsOptional()
  @IsBoolean()
  unassigned?: boolean;
}