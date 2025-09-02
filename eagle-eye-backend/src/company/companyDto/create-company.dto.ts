import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string; // default 'USA' if not provided

  @IsNumber()
  @IsOptional() // nullable: true in entity, so it's optional
  ownerId?: number;
}
