import { IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

// --- Create Event DTO ---
// DTO for creating new events in the Eagle Eye system
// This follows MCP Context 7 best practices for data validation

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startTime: string; // ISO date string

  @IsDateString()
  @IsOptional()
  endTime?: string; // ISO date string
}
