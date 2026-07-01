import { PartialType } from '@nestjs/mapped-types';
import { CreateVenueDto } from './create-venue.dto';

// Every field optional — the admin edit form can patch any subset.
export class UpdateVenueDto extends PartialType(CreateVenueDto) {}
