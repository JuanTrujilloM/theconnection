import { Type } from 'class-transformer';
import {
  IsInt,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  GENDERS,
  SEMESTERS,
  MAX_BIO_LENGTH,
} from '../constants/profile-options';
import { IsAdult } from '../validators/is-adult.validator';

// HU-02 payload. Fields arrive as multipart/form-data alongside the photo files,
// so numeric values are coerced with @Type. University is derived server-side
// from the verified email, not accepted here.
export class CreateProfileDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  name!: string;

  @IsString()
  @IsAdult({ message: 'User must be older than 17.' })
  dateOfBirth!: string;

  @IsIn(GENDERS, { message: 'Invalid gender.' })
  gender!: string;

  @Type(() => Number)
  @IsInt()
  @Min(120, { message: 'Invalid height.' })
  @Max(230, { message: 'Invalid height.' })
  height!: number;

  @IsString()
  @IsNotEmpty({ message: 'Biography is required.' })
  @MaxLength(MAX_BIO_LENGTH, {
    message: `Biography must be at most ${MAX_BIO_LENGTH} characters.`,
  })
  biography!: string;

  @IsString()
  @IsNotEmpty({ message: 'Major is required.' })
  major!: string;

  @IsIn(SEMESTERS, { message: 'Invalid semester.' })
  semester!: string;

  // Ordered JSON array describing the final photo set: each entry is 'new'
  // (next uploaded file) or 'keep:<url>' (retain an existing photo).
  @IsOptional()
  @IsString()
  photoManifest?: string;
}
