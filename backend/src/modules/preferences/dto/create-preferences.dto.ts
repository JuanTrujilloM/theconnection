import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  RELATIONSHIP_TYPES,
  ORIENTATIONS,
  GENDER_INTERESTS,
  HEIGHT_RANGES,
  AGE_MIN,
  AGE_MAX,
  MIN_HOBBIES,
  MIN_VIBES,
} from '../constants/preferences-options';

class AgeRangeDto {
  @IsInt()
  @Min(AGE_MIN)
  @Max(AGE_MAX)
  min!: number;

  @IsInt()
  @Min(AGE_MIN)
  @Max(AGE_MAX)
  max!: number;
}

// HU-03 payload (JSON). Shape mirrors the frontend form values exactly.
export class CreatePreferencesDto {
  @ValidateNested()
  @Type(() => AgeRangeDto)
  ageRange!: AgeRangeDto;

  @IsArray()
  @ArrayMinSize(MIN_HOBBIES, {
    message: `Select at least ${MIN_HOBBIES} hobbies.`,
  })
  @IsString({ each: true })
  hobbies!: string[];

  @IsIn(RELATIONSHIP_TYPES, { message: 'Invalid relationship type.' })
  relationshipType!: string;

  @IsIn(ORIENTATIONS, { message: 'Invalid orientation.' })
  orientation!: string;

  @IsIn(GENDER_INTERESTS, { message: 'Invalid gender interest.' })
  genderInterest!: string;

  @IsBoolean()
  sameUniversity!: boolean;

  @IsIn(HEIGHT_RANGES, { message: 'Invalid height range.' })
  heightRange!: string;

  @IsArray()
  @ArrayMinSize(MIN_VIBES, { message: 'Select at least one vibe.' })
  @IsString({ each: true })
  energyVibe!: string[];
}
