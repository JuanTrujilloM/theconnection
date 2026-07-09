import { Module } from '@nestjs/common';
import { WhatsappNotifierService } from './whatsapp-notifier.service';

// Outbound WhatsApp transport (dev-mode logger for now). Kept dependency-free so
// the matching flow can send notifications without pulling in unrelated modules.
@Module({
  providers: [WhatsappNotifierService],
  exports: [WhatsappNotifierService],
})
export class WhatsappModule {}
