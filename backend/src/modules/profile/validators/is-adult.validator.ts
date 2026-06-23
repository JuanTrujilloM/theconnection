import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { MIN_AGE } from '../constants/profile-options';

// Whole years between a birth date and today.
function ageInYears(isoDate: string): number {
  const birth = new Date(isoDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

@ValidatorConstraint({ name: 'isAdult', async: false })
export class IsAdultConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && ageInYears(value) >= MIN_AGE;
  }

  defaultMessage(): string {
    return `User must be at least ${MIN_AGE} years old.`;
  }
}

// Validates that a date-of-birth string makes the user an adult (HU-02).
export function IsAdult(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: IsAdultConstraint,
    });
  };
}
