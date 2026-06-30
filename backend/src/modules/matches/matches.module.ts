import { Module } from '@nestjs/common';
import { VenuesModule } from '../venues/venues.module';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [VenuesModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
