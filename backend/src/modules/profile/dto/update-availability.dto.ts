import { IsIn } from 'class-validator';
import { AVAILABILITY_STATUSES } from '../constants/profile-options';

// Dashboard searching/paused toggle. Only the two known statuses are accepted.
export class UpdateAvailabilityDto {
  @IsIn(AVAILABILITY_STATUSES, { message: 'Invalid availability status.' })
  status!: string;
}
