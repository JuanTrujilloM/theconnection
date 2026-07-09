import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';
import { MIN_VENUE_SELECTION } from '../matches.constants';

// HU-06: exactly 2 of the 3 suggested places must be chosen — capping at 2 (not
// just requiring 2) is what forces both users to share at least one venue.
export class SelectVenuesDto {
  @IsArray()
  @ArrayMinSize(MIN_VENUE_SELECTION, {
    message: `Choose exactly ${MIN_VENUE_SELECTION} places.`,
  })
  @ArrayMaxSize(MIN_VENUE_SELECTION, {
    message: `Choose exactly ${MIN_VENUE_SELECTION} places.`,
  })
  @IsString({ each: true })
  venueIds!: string[];
}
