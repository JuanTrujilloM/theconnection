import { emailLayout, escapeHtml } from './email-layout';

// HU-08 email twin of the WhatsApp date proposal: the confirmed plan as a
// detail card (who / where / address / when).
export interface DateConfirmationEmailData {
  recipientName: string;
  partnerName: string;
  whenText: string; // slot label built by match-confirmation, e.g. "jue 17 jul · 14:00"
  venueName: string;
  venueAddress: string;
}

export function dateConfirmationEmail(data: DateConfirmationEmailData): {
  subject: string;
  html: string;
} {
  const rows = [
    ['Con', data.partnerName],
    ['Lugar', data.venueName],
    ['Dirección', data.venueAddress],
    ['Cuándo', data.whenText],
  ]
    .filter(([, value]) => value)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 8px 12px; color: #6b7280; font-size: 13px; width: 90px;">${label}</td>
          <td style="padding: 8px 12px; font-size: 15px; font-weight: 600;">${escapeHtml(value)}</td>
        </tr>
      `,
    )
    .join('');

  return {
    subject: `¡Coincidieron! Tu cita con ${data.partnerName} 🎉`,
    html: emailLayout(`
      <h2 style="margin: 0 0 4px; font-size: 22px;">Hey ${escapeHtml(data.recipientName)},</h2>
      <p style="margin: 0 0 20px; font-size: 16px;">¡tu cita está lista! 🎉</p>
      <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px;">
        ${rows}
      </table>
      <p style="margin: 20px 0 0; font-size: 14px; color: #6b7280; text-align: center;">
        ${escapeHtml(data.partnerName)} también recibió esta confirmación. ¡Que la disfruten!
      </p>
    `),
  };
}
