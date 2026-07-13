import { emailLayout, escapeHtml } from './email-layout';

// HU-07: the match didn't move forward (rejection or 48h timeout). Copy mirrors
// the WhatsApp message.
export function matchRejectedEmail(recipientName: string): {
  subject: string;
  html: string;
} {
  return {
    subject: 'Tu match de esta semana no continuó 😞',
    html: emailLayout(`
      <h2 style="margin: 0 0 12px; font-size: 22px;">Hey ${escapeHtml(recipientName)},</h2>
      <p style="margin: 0; font-size: 15px;">
        Tu match de la semana no continuó 😞. Te buscaremos otro en el próximo
        ciclo. ¡No te desanimes!
      </p>
    `),
  };
}
