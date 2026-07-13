import { IsEmail } from 'class-validator';

export class ResendCodeDto {
  @IsEmail({}, { message: 'A valid email address is required.' })
  email!: string;
}
