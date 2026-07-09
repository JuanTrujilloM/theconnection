import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Match summary shown in the first notification (HU-05 body).
export interface MatchInvite {
  cellphone: string;
  partnerName: string;
  availabilityUrl: string;
}

// HU-08 date proposal, sent when the two users' availability + place overlap.
export interface DateProposal {
  cellphone: string;
  partnerName: string;
  whenText: string;
  venueName: string;
}

// Outbound WhatsApp. The Cloud API transport is still in progress, so until it
// lands this runs in dev mode: it logs the message instead of sending, exactly
// like MailService does when SMTP is unconfigured. When the transport arrives,
// only the private send() body changes; callers stay the same.
@Injectable()
export class WhatsappNotifierService {
  private readonly logger = new Logger(WhatsappNotifierService.name);
  // Real send is enabled once a WhatsApp token is configured.
  private readonly devMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.devMode = !this.config.get<string>('WHATSAPP_TOKEN');
  }

  // First notification (HU-05): who the match is + link to pick availability.
  sendAvailabilityInvite(invite: MatchInvite): Promise<void> {
    return this.send(
      invite.cellphone,
      `¡Tenemos tu match de la semana con ${invite.partnerName}! 🎉 ` +
        `Marca tus horarios disponibles aquí: ${invite.availabilityUrl}`,
    );
  }

  // HU-08: their availability + place matched — proposes the date to confirm.
  sendDateProposal(proposal: DateProposal): Promise<void> {
    return this.send(
      proposal.cellphone,
      `¡Coincidieron con ${proposal.partnerName}! 🎉 Su cita sería el ` +
        `${proposal.whenText} en ${proposal.venueName}. Está esperando confirmación.`,
    );
  }

  // HU-08 no-overlap nudge: reopen availability so they can add more slots.
  sendMoreAvailabilityRequest(invite: MatchInvite): Promise<void> {
    return this.send(
      invite.cellphone,
      `Tus horarios no coincidieron con los de ${invite.partnerName} 😕. ` +
        `Agrega más franjas para intentarlo: ${invite.availabilityUrl}`,
    );
  }

  // HU-07: the match didn't move forward (the other user rejected, or nobody
  // responded in time). Sent to whoever is still waiting.
  sendMatchRejected(cellphone: string): Promise<void> {
    return this.send(
      cellphone,
      'Tu match de la semana no continuó 😞. Te buscaremos otro en el próximo ' +
        'ciclo. ¡No te desanimes!',
    );
  }

  // HU-08 recycle: scheduling failed; the match returns to the next weekly cycle.
  sendReschedulingFailed(cellphone: string): Promise<void> {
    return this.send(
      cellphone,
      'No logramos coordinar una cita esta vez 😞. Te buscaremos otro match ' +
        'en el próximo ciclo. ¡No te desanimes!',
    );
  }

  private send(cellphone: string, text: string): Promise<void> {
    if (this.devMode) {
      // Dev shortcut: log the message so you can follow the flow without WhatsApp.
      this.logger.warn(
        `[dev whatsapp] to ${cellphone}: ${text} (WHATSAPP_TOKEN not configured)`,
      );
      return Promise.resolve();
    }

    // TODO: Meta WhatsApp Cloud API send, built with the transport module.
    this.logger.log(`Sending WhatsApp message to ${cellphone}`);
    return Promise.resolve();
  }
}
