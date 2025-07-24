import { IsEmail, IsString, IsNotEmpty, IsNumber, Length, Matches, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  @Matches(/^[a-zA-Z\s]+$/, { message: 'First name must contain only letters and spaces' })
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Last name must contain only letters and spaces' })
  last_name: string;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' })
  phone?: string;

  @IsNumber()
  roleId: number;
}
