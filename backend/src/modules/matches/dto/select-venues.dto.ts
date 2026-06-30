import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';
import { MIN_VENUE_SELECTION, SUGGESTION_COUNT } from '../matches.constants';

// HU-06 acceptance: at least 2 of the 3 suggested places must be chosen.
export class SelectVenuesDto {
  @IsArray()
  @ArrayMinSize(MIN_VENUE_SELECTION, {
    message: `Select at least ${MIN_VENUE_SELECTION} places.`,
  })
  @ArrayMaxSize(SUGGESTION_COUNT)
  @IsString({ each: true })
  venueIds!: string[];
}
