import { IsEmail, IsMobilePhone } from 'class-validator';
import { IsSupportedUniversityEmail } from '../validators/is-supported-university-email.validator';

export class RegisterDto {
  @IsEmail({}, { message: 'A valid email address is required.' })
  @IsSupportedUniversityEmail()
  email!: string;

  @IsMobilePhone(
    'es-CO',
    {},
    { message: 'A valid Colombian mobile number is required.' },
  )
  cellphone!: string;
}
