import { emailLayout, escapeHtml } from './email-layout';

// HU-08 recycle: scheduling failed, the match returns to the next weekly cycle.
// Copy mirrors the WhatsApp message.
export function reschedulingFailedEmail(recipientName: string): {
  subject: string;
  html: string;
} {
  return {
    subject: 'No logramos coordinar tu cita esta vez',
    html: emailLayout(`
      <h2 style="margin: 0 0 12px; font-size: 22px;">Hey ${escapeHtml(recipientName)},</h2>
      <p style="margin: 0; font-size: 15px;">
        No logramos coordinar una cita esta vez 😞. Te buscaremos otro match en
        el próximo ciclo. ¡No te desanimes!
      </p>
    `),
  };
}
