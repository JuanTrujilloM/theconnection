import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isSupportedUniversityEmail } from '../constants/university-domains';

// Custom validator to check if an email belongs to a supported university domain.
@ValidatorConstraint({ name: 'isSupportedUniversityEmail', async: false })
export class IsSupportedUniversityEmailConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && isSupportedUniversityEmail(value);
  }

  defaultMessage(): string {
    return 'Only verified university emails are accepted.';
  }
}

// Decorator to apply the custom validator on DTO properties.
export function IsSupportedUniversityEmail(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSupportedUniversityEmailConstraint,
    });
  };
}
