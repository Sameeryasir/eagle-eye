import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

// --- Save Token DTO ---
// DTO for accepting expo push token from frontend
// User ID is now extracted from JWT token for security
// This follows MCP Context 7 best practices for clean, simple validation

export class SaveTokenDto {
  @IsString()
  @IsNotEmpty()
  expoPushToken: string; // The expo push token from frontend

  @IsOptional()
  @IsString()
  platform?: 'ios' | 'android' | 'web'; // Optional platform info

  @IsOptional()
  @IsString()
  deviceType?: string; // Optional device type (mobile, tablet, etc.)
}
