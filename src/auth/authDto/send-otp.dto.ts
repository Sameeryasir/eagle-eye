import {
  IsEmail,
  Matches,
  Length,
  ValidateIf,
} from 'class-validator';

export class SendOtpDto {
  @ValidateIf((o) => !o.phone)
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ValidateIf((o) => !o.email)
  @Matches(/^\d+$/, { message: 'Phone must be numeric' })
  @Length(11, 11, { message: 'Phone must be exactly 11 digits' })
  phone?: string;
}
