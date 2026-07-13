import { IsEmail, IsNumberString, Length } from 'class-validator';

export class VerifyCodeDto {
  @IsEmail({}, { message: 'A valid email address is required.' })
  email!: string;

  @IsNumberString({}, { message: 'The verification code must be numeric.' })
  @Length(6, 6, { message: 'The verification code must be 6 digits.' })
  code!: string;
}
