import { Module } from '@nestjs/common';
import { MatchesModule } from '../matches/matches.module';
import { AvailabilityLinkModule } from '../availability-link/availability-link.module';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';

// Public token flow (HU-06 places first, then HU-09 availability). Reuses
// MatchesService for place suggestions/selection, MatchConfirmationService for
// the HU-08 check on the last step, and AvailabilityLinkService for tokens.
@Module({
  imports: [MatchesModule, AvailabilityLinkModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
