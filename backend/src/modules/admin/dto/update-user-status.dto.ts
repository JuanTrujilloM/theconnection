import { IsIn } from 'class-validator';
import { AVAILABILITY_STATUSES } from '../../profile/constants/profile-options';

// Admin toggles a user's matching availability between SEARCHING and PAUSED.
export class UpdateUserStatusDto {
  @IsIn(AVAILABILITY_STATUSES, { message: 'Invalid status.' })
  status!: string;
}
