import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { matchInviteEmail } from '../mail/templates/match-invite.template';
import { dateConfirmationEmail } from '../mail/templates/date-confirmation.template';
import { moreAvailabilityEmail } from '../mail/templates/more-availability.template';
import { matchRejectedEmail } from '../mail/templates/match-rejected.template';
import { reschedulingFailedEmail } from '../mail/templates/rescheduling-failed.template';
import {
  DateProposalNotification,
  MatchInviteNotification,
  MoreAvailabilityNotification,
  Recipient,
} from './notification-payloads';

// Email side of each notification: maps a payload to its template and sends.
// Channel fan-out and failure isolation live in NotificationsService.
@Injectable()
export class NotificationEmailsService {
  constructor(private readonly mail: MailService) {}

  sendMatchInvite(notification: MatchInviteNotification): Promise<void> {
    return this.mail.send(
      notification.recipient.email,
      matchInviteEmail({
        recipientName: notification.recipient.name,
        partner: notification.partner,
        availabilityUrl: notification.availabilityUrl,
        expiresInDays: notification.expiresInDays,
      }),
    );
  }

  sendDateProposal(notification: DateProposalNotification): Promise<void> {
    return this.mail.send(
      notification.recipient.email,
      dateConfirmationEmail({
        recipientName: notification.recipient.name,
        partnerName: notification.partnerName,
        whenText: notification.whenText,
        venueName: notification.venueName,
        venueAddress: notification.venueAddress,
      }),
    );
  }

  sendMoreAvailabilityRequest(
    notification: MoreAvailabilityNotification,
  ): Promise<void> {
    return this.mail.send(
      notification.recipient.email,
      moreAvailabilityEmail({
        recipientName: notification.recipient.name,
        partnerName: notification.partnerName,
        availabilityUrl: notification.availabilityUrl,
      }),
    );
  }

  sendMatchRejected(recipient: Recipient): Promise<void> {
    return this.mail.send(recipient.email, matchRejectedEmail(recipient.name));
  }

  sendReschedulingFailed(recipient: Recipient): Promise<void> {
    return this.mail.send(
      recipient.email,
      reschedulingFailedEmail(recipient.name),
    );
  }
}
