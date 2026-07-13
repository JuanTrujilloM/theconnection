import { Injectable, Logger } from '@nestjs/common';
import { WhatsappNotifierService } from '../whatsapp/whatsapp-notifier.service';
import { NotificationEmailsService } from './notification-emails.service';
import {
  DateProposalNotification,
  MatchInviteNotification,
  MoreAvailabilityNotification,
  Recipient,
} from './notification-payloads';

// Fans each notification out to WhatsApp + email. dispatch() never rejects:
// one channel failing must not sink the other, nor the caller's flow (e.g. the
// confirmation that already committed its transaction).
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly whatsapp: WhatsappNotifierService,
    private readonly emails: NotificationEmailsService,
  ) {}

  notifyMatchInvite(notification: MatchInviteNotification): Promise<void> {
    return this.dispatch('match invite', [
      this.whatsapp.sendAvailabilityInvite({
        cellphone: notification.recipient.cellphone,
        partnerName: notification.partner.name,
        availabilityUrl: notification.availabilityUrl,
      }),
      this.emails.sendMatchInvite(notification),
    ]);
  }

  notifyDateProposal(notification: DateProposalNotification): Promise<void> {
    return this.dispatch('date proposal', [
      this.whatsapp.sendDateProposal({
        cellphone: notification.recipient.cellphone,
        partnerName: notification.partnerName,
        whenText: notification.whenText,
        venueName: notification.venueName,
      }),
      this.emails.sendDateProposal(notification),
    ]);
  }

  notifyMoreAvailabilityRequest(
    notification: MoreAvailabilityNotification,
  ): Promise<void> {
    return this.dispatch('more availability request', [
      this.whatsapp.sendMoreAvailabilityRequest({
        cellphone: notification.recipient.cellphone,
        partnerName: notification.partnerName,
        availabilityUrl: notification.availabilityUrl,
      }),
      this.emails.sendMoreAvailabilityRequest(notification),
    ]);
  }

  notifyMatchRejected(recipient: Recipient): Promise<void> {
    return this.dispatch('match rejected', [
      this.whatsapp.sendMatchRejected(recipient.cellphone),
      this.emails.sendMatchRejected(recipient),
    ]);
  }

  notifyReschedulingFailed(recipient: Recipient): Promise<void> {
    return this.dispatch('rescheduling failed', [
      this.whatsapp.sendReschedulingFailed(recipient.cellphone),
      this.emails.sendReschedulingFailed(recipient),
    ]);
  }

  private async dispatch(label: string, sends: Promise<void>[]): Promise<void> {
    const results = await Promise.allSettled(sends);
    for (const result of results) {
      if (result.status === 'rejected') {
        this.logger.error(`${label} send failed`, result.reason as Error);
      }
    }
  }
}
