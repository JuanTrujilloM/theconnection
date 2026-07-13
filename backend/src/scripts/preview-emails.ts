import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { matchInviteEmail } from '../modules/mail/templates/match-invite.template';
import { dateConfirmationEmail } from '../modules/mail/templates/date-confirmation.template';
import { moreAvailabilityEmail } from '../modules/mail/templates/more-availability.template';
import { matchRejectedEmail } from '../modules/mail/templates/match-rejected.template';
import { reschedulingFailedEmail } from '../modules/mail/templates/rescheduling-failed.template';

// Renders every notification email with sample data so the layout can be
// checked in a browser without sending anything. Templates are pure functions,
// so no Nest context is needed.
// Usage (after `npm run build`):
//   node dist/src/scripts/preview-emails.js [outputDir]   # default ./email-previews

const partner = {
  name: 'Abby',
  age: 21,
  university: 'EAFIT',
  major: 'Diseño Interactivo',
  photoUrl: 'https://picsum.photos/seed/theconnection/520/420',
};

const availabilityUrl = 'http://localhost:3000/flow/sample-token/places';

const previews: Record<string, { subject: string; html: string }> = {
  'match-invite': matchInviteEmail({
    recipientName: 'Jerónimo',
    partner,
    availabilityUrl,
    expiresInDays: 3,
  }),
  'match-invite-no-photo': matchInviteEmail({
    recipientName: 'Jerónimo',
    partner: { ...partner, photoUrl: null },
    availabilityUrl,
    expiresInDays: 3,
  }),
  'date-confirmation': dateConfirmationEmail({
    recipientName: 'Jerónimo',
    partnerName: 'Abby',
    whenText: 'jue 17 jul · 14:00',
    venueName: 'Café Velvet',
    venueAddress: 'Cra 37 #8A-46, El Poblado',
  }),
  'more-availability': moreAvailabilityEmail({
    recipientName: 'Jerónimo',
    partnerName: 'Abby',
    availabilityUrl: 'http://localhost:3000/availability/sample-token',
  }),
  'match-rejected': matchRejectedEmail('Jerónimo'),
  'rescheduling-failed': reschedulingFailedEmail('Jerónimo'),
};

const outputDir = process.argv[2] ?? join(process.cwd(), 'email-previews');
mkdirSync(outputDir, { recursive: true });

for (const [name, { subject, html }] of Object.entries(previews)) {
  const file = join(outputDir, `${name}.html`);
  writeFileSync(file, `<!-- subject: ${subject} -->\n${html}`);
  console.log(`${file}  —  "${subject}"`);
}
