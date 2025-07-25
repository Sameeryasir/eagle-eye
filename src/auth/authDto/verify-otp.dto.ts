import { IsEmail, Matches, Length, ValidateIf } from 'class-validator';

export class VerifyOtpDto {
  @ValidateIf((o) => !o.phone)
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ValidateIf((o) => !o.email)
  @Matches(/^\d+$/, { message: 'Phone number must contain only digits' })
  @Length(11, 11, { message: 'Phone number must be exactly 11 digits' })
  phone?: string;

  @Matches(/^\d+$/, { message: 'Code must contain only numeric characters' })
  code: string;
}
