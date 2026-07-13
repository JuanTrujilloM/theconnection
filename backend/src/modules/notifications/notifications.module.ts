import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { NotificationEmailsService } from './notification-emails.service';
import { NotificationsService } from './notifications.service';

// Single entry point for user-facing notifications; every message goes out via
// WhatsApp and email together.
@Module({
  imports: [WhatsappModule, MailModule],
  providers: [NotificationsService, NotificationEmailsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
