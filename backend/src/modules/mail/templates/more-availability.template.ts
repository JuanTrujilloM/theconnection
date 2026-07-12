import { ctaButton, emailLayout, escapeHtml } from './email-layout';

// HU-08 no-overlap nudge: schedules didn't match, ask for more time slots.
export interface MoreAvailabilityEmailData {
  recipientName: string;
  partnerName: string;
  availabilityUrl: string;
}

export function moreAvailabilityEmail(data: MoreAvailabilityEmailData): {
  subject: string;
  html: string;
} {
  return {
    subject: `Agrega más horarios para coincidir con ${data.partnerName}`,
    html: emailLayout(`
      <h2 style="margin: 0 0 12px; font-size: 22px;">Hey ${escapeHtml(data.recipientName)},</h2>
      <p style="margin: 0; font-size: 15px;">
        Tus horarios no coincidieron con los de ${escapeHtml(data.partnerName)} 😕.
        Agrega más franjas para intentarlo de nuevo.
      </p>
      ${ctaButton('Agregar horarios', data.availabilityUrl)}
    `),
  };
}
