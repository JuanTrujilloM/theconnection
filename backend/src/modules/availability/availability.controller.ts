import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SelectVenuesDto } from '../matches/dto/select-venues.dto';
import { AvailabilityService } from './availability.service';
import { SubmitAvailabilityDto } from './dto/submit-availability.dto';

// Public, token-authenticated flow opened from the first WhatsApp notification.
// No JwtAuthGuard: the opaque token in the path is the credential, so a student
// completes availability (HU-09) and place selection (HU-06) without logging in.
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get(':token')
  getAvailability(@Param('token') token: string) {
    return this.availabilityService.getAvailabilityView(token);
  }

  @Post(':token')
  submitAvailability(
    @Param('token') token: string,
    @Body() dto: SubmitAvailabilityDto,
  ) {
    return this.availabilityService.submitAvailability(token, dto.slots);
  }

  @Get(':token/venues')
  getVenues(@Param('token') token: string) {
    return this.availabilityService.getVenuesView(token);
  }

  @Post(':token/venues')
  selectVenues(@Param('token') token: string, @Body() dto: SelectVenuesDto) {
    return this.availabilityService.selectVenues(token, dto.venueIds);
  }
}
