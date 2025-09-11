import { IsString, IsOptional, IsDateString } from 'class-validator';

// --- Update Event DTO ---
// DTO for updating existing events in the Eagle Eye system
// This follows MCP Context 7 best practices for data validation

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string; // ISO date string

  @IsOptional()
  @IsDateString()
  endTime?: string; // ISO date string
}
