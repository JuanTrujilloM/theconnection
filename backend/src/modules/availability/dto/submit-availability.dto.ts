import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsISO8601,
  ValidateNested,
} from 'class-validator';
import { MIN_SLOTS, TIME_SLOTS } from '../availability.constants';

// One selected cell in the calendar: a day + a slot start hour. The day's
// 7-day window is enforced in the service (it depends on "today"); here we only
// pin the shape and the fixed slot vocabulary.
export class SlotSelectionDto {
  @IsISO8601({ strict: true })
  date!: string;

  @IsIn(TIME_SLOTS)
  timeSlot!: string;
}

export class SubmitAvailabilityDto {
  @IsArray()
  @ArrayMinSize(MIN_SLOTS, { message: 'Selecciona al menos un horario.' })
  @ValidateNested({ each: true })
  @Type(() => SlotSelectionDto)
  slots!: SlotSelectionDto[];
}
