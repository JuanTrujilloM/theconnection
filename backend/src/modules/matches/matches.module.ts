import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { VenuesModule } from '../venues/venues.module';
import { AvailabilityLinkModule } from '../availability-link/availability-link.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { MatchInviteService } from './match-invite.service';
import { MatchConfirmationService } from './match-confirmation.service';
import { MatchResponseService } from './match-response.service';
import { WeeklyMatchingService } from './weekly-matching.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    VenuesModule,
    AvailabilityLinkModule,
    NotificationsModule,
  ],
  controllers: [MatchesController],
  providers: [
    MatchesService,
    MatchInviteService,
    MatchConfirmationService,
    MatchResponseService,
    WeeklyMatchingService,
  ],
  // MatchesService: reused by the public availability flow (HU-06 place logic).
  // MatchConfirmationService: called by the availability flow's last step (HU-08).
  // MatchInviteService: reused by the manual link-issuing script.
  // MatchResponseService: reused by the chatbot's reject_match tool.
  exports: [
    MatchesService,
    MatchConfirmationService,
    MatchInviteService,
    MatchResponseService,
  ],
})
export class MatchesModule {}
