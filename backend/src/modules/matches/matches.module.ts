import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { VenuesModule } from '../venues/venues.module';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { WeeklyMatchingService } from './weekly-matching.service';

@Module({
  imports: [ScheduleModule.forRoot(), VenuesModule],
  controllers: [MatchesController],
  providers: [MatchesService, WeeklyMatchingService],
})
export class MatchesModule {}
