import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsNumber,
  Length,
  Matches,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'First name must contain only letters and spaces',
  })
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Last name must contain only letters and spaces',
  })
  last_name: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'Phone must be numeric' })
  @Length(11, 11, { message: 'Phone must be exactly 11 digits' })
  phone?: string;

  @IsOptional()
  @ValidateIf((o) => o.roleId !== undefined && o.roleId !== null)
  @IsNumber({}, { message: 'Role ID must be a number' })
  roleId?: number;
}
