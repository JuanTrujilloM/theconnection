import { Module } from '@nestjs/common';
import { MatchesModule } from '../matches/matches.module';
import { AvailabilityLinkModule } from '../availability-link/availability-link.module';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';

// Public token flow (HU-09 -> HU-06). Reuses MatchesService for place
// suggestions/selection and AvailabilityLinkService for token validation.
@Module({
  imports: [MatchesModule, AvailabilityLinkModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
