import { ctaButton, emailLayout, escapeHtml } from './email-layout';

// HU-05 email twin of the WhatsApp availability invite: partner card with the
// primary photo, link-expiry banner, and the magic link behind a CTA button.
export interface MatchInviteEmailData {
  recipientName: string;
  partner: {
    name: string;
    age: number | null;
    university: string | null;
    major: string | null;
    photoUrl: string | null;
  };
  availabilityUrl: string;
  expiresInDays: number;
}

export function matchInviteEmail(data: MatchInviteEmailData): {
  subject: string;
  html: string;
} {
  const partnerName = escapeHtml(data.partner.name);
  return {
    subject: `¡${data.partner.name} es tu match de la semana! 💘`,
    html: emailLayout(`
      <h2 style="margin: 0 0 4px; font-size: 22px;">Hey ${escapeHtml(data.recipientName)},</h2>
      <p style="margin: 0 0 20px; font-size: 16px;">¡encontramos tu cita de esta semana!</p>
      <div style="background: #be185d; color: #ffffff; font-size: 13px; font-weight: 600; text-align: center; padding: 8px; border-radius: 8px 8px 0 0;">
        ⏳ El enlace expira en ${data.expiresInDays} días
      </div>
      ${photoCard(data.partner, partnerName)}
      <p style="margin: 20px 0 0; font-size: 15px; text-align: center;">
        ${partnerName} está esperando tu disponibilidad: elige los lugares y tus horarios.
      </p>
      ${ctaButton('Elegir horario', data.availabilityUrl)}
    `),
  };
}

// Caption bar below the photo, not overlaid: absolute positioning and
// text-over-background-image are unreliable in Outlook/Gmail.
function photoCard(
  partner: MatchInviteEmailData['partner'],
  escapedName: string,
): string {
  const title = partner.age ? `${escapedName}, ${partner.age}` : escapedName;
  const subtitle = [partner.university, partner.major]
    .filter((part): part is string => Boolean(part))
    .map(escapeHtml)
    .join(' · ');

  const photo = partner.photoUrl
    ? `<img src="${partner.photoUrl}" alt="Foto de ${escapedName}" style="display: block; width: 100%; max-width: 100%; height: auto;" />`
    : '';

  return `
    <div style="border-radius: 0 0 12px 12px; overflow: hidden; border: 1px solid #e5e7eb; border-top: none;">
      ${photo}
      <div style="background: #111114; padding: 14px 16px;">
        <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700;">${title}</p>
        ${subtitle ? `<p style="margin: 4px 0 0; color: #9ca3af; font-size: 13px;">${subtitle}</p>` : ''}
      </div>
    </div>
  `;
}
