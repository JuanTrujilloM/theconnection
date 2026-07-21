import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  MAX_COMMENTS_LENGTH,
  RATING_MAX,
  RATING_MIN,
} from '../feedback.constants';

// HU-10 payload. occurred answers "did the date happen?"; rating and amountSpent
// only make sense when it did, so they stay optional and are validated as a set
// in the service, not here.
export class CreateFeedbackDto {
  @IsString()
  dateId!: string;

  @IsBoolean()
  occurred!: boolean;

  @IsOptional()
  @IsInt()
  @Min(RATING_MIN)
  @Max(RATING_MAX)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_COMMENTS_LENGTH)
  comments?: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_COMMENTS_LENGTH)
  noShowReason?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountSpent?: number;
}
