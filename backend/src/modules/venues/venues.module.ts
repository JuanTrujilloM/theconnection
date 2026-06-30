import { Module } from '@nestjs/common';
import { VenuesController } from './venues.controller';
import { VenuesService } from './venues.service';

@Module({
  controllers: [VenuesController],
  providers: [VenuesService],
  // Exported so MatchesModule can draw on the active-venue pool for suggestions.
  exports: [VenuesService],
})
export class VenuesModule {}
