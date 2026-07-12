import { WhatsappNotifierService } from '../whatsapp/whatsapp-notifier.service';
import { matchInviteEmail } from '../mail/templates/match-invite.template';
import { NotificationEmailsService } from './notification-emails.service';
import { NotificationsService } from './notifications.service';
import {
  MatchInviteNotification,
  buildPartnerSummary,
} from './notification-payloads';

const recipient = {
  name: 'Jerónimo',
  email: 'jero@eafit.edu.co',
  cellphone: '+573001112233',
};

const invite: MatchInviteNotification = {
  recipient,
  partner: {
    name: 'Abby',
    age: 21,
    university: 'EAFIT',
    major: 'Diseño',
    photoUrl: 'https://bucket.s3.us-east-1.amazonaws.com/profiles/a.jpg',
  },
  availabilityUrl: 'http://localhost:3000/flow/tok123/places',
  expiresInDays: 3,
};

function makeService() {
  const whatsapp = {
    sendAvailabilityInvite: jest.fn().mockResolvedValue(undefined),
    sendDateProposal: jest.fn().mockResolvedValue(undefined),
    sendMoreAvailabilityRequest: jest.fn().mockResolvedValue(undefined),
    sendMatchRejected: jest.fn().mockResolvedValue(undefined),
    sendReschedulingFailed: jest.fn().mockResolvedValue(undefined),
  };
  const emails = {
    sendMatchInvite: jest.fn().mockResolvedValue(undefined),
    sendDateProposal: jest.fn().mockResolvedValue(undefined),
    sendMoreAvailabilityRequest: jest.fn().mockResolvedValue(undefined),
    sendMatchRejected: jest.fn().mockResolvedValue(undefined),
    sendReschedulingFailed: jest.fn().mockResolvedValue(undefined),
  };
  const service = new NotificationsService(
    whatsapp as unknown as WhatsappNotifierService,
    emails as unknown as NotificationEmailsService,
  );
  return { service, whatsapp, emails };
}

describe('NotificationsService', () => {
  it('fans the invite out to WhatsApp (narrowed payload) and email', async () => {
    const { service, whatsapp, emails } = makeService();
    await service.notifyMatchInvite(invite);

    expect(whatsapp.sendAvailabilityInvite).toHaveBeenCalledWith({
      cellphone: recipient.cellphone,
      partnerName: 'Abby',
      availabilityUrl: invite.availabilityUrl,
    });
    expect(emails.sendMatchInvite).toHaveBeenCalledWith(invite);
  });

  it('fans the date proposal out to both channels', async () => {
    const { service, whatsapp, emails } = makeService();
    const proposal = {
      recipient,
      partnerName: 'Abby',
      whenText: 'jue 17 jul · 14:00',
      venueName: 'Café Velvet',
      venueAddress: 'Cra 37 #8A-46',
    };
    await service.notifyDateProposal(proposal);

    expect(whatsapp.sendDateProposal).toHaveBeenCalledWith({
      cellphone: recipient.cellphone,
      partnerName: 'Abby',
      whenText: 'jue 17 jul · 14:00',
      venueName: 'Café Velvet',
    });
    expect(emails.sendDateProposal).toHaveBeenCalledWith(proposal);
  });

  it('still sends WhatsApp and resolves when the email channel fails', async () => {
    const { service, whatsapp, emails } = makeService();
    emails.sendMatchInvite.mockRejectedValue(new Error('smtp down'));

    await expect(service.notifyMatchInvite(invite)).resolves.toBeUndefined();
    expect(whatsapp.sendAvailabilityInvite).toHaveBeenCalled();
  });

  it('still sends email and resolves when the WhatsApp channel fails', async () => {
    const { service, whatsapp, emails } = makeService();
    whatsapp.sendMatchRejected.mockRejectedValue(new Error('meta down'));

    await expect(
      service.notifyMatchRejected(recipient),
    ).resolves.toBeUndefined();
    expect(emails.sendMatchRejected).toHaveBeenCalledWith(recipient);
  });
});

describe('buildPartnerSummary', () => {
  it('prefers the primary photo and falls back to the first', () => {
    const base = {
      name: 'Abby',
      dateOfBirth: new Date('2004-05-01'),
      university: 'EAFIT',
      major: 'Diseño',
    };
    const withPrimary = buildPartnerSummary({
      ...base,
      photos: [
        { url: 'first.jpg', isPrimary: false },
        { url: 'primary.jpg', isPrimary: true },
      ],
    });
    expect(withPrimary.photoUrl).toBe('primary.jpg');

    const withoutPrimary = buildPartnerSummary({
      ...base,
      photos: [{ url: 'first.jpg', isPrimary: false }],
    });
    expect(withoutPrimary.photoUrl).toBe('first.jpg');
  });

  it('degrades to a generic partner when the profile is missing', () => {
    expect(buildPartnerSummary(null)).toEqual({
      name: 'tu match',
      age: null,
      university: null,
      major: null,
      photoUrl: null,
    });
  });
});

describe('matchInviteEmail', () => {
  it('includes the CTA link, expiry days, and escaped partner data', () => {
    const { subject, html } = matchInviteEmail({
      recipientName: 'Jerónimo',
      partner: { ...invite.partner, name: '<b>Abby</b>' },
      availabilityUrl: invite.availabilityUrl,
      expiresInDays: 3,
    });

    expect(subject).toContain('match de la semana');
    expect(html).toContain(invite.availabilityUrl);
    expect(html).toContain('expira en 3 días');
    expect(html).toContain('&lt;b&gt;Abby&lt;/b&gt;');
    expect(html).not.toContain('<b>Abby</b>');
    expect(html).toContain(invite.partner.photoUrl as string);
  });

  it('omits the photo block when there is no photo', () => {
    const { html } = matchInviteEmail({
      recipientName: 'Jerónimo',
      partner: { ...invite.partner, photoUrl: null },
      availabilityUrl: invite.availabilityUrl,
      expiresInDays: 3,
    });
    expect(html).not.toContain('<img');
  });
});
