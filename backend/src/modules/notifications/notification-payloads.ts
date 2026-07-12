// Channel-agnostic notification payloads. The dispatcher narrows these down to
// what each channel needs (WhatsApp: cellphone + text, email: rich template).

export interface Recipient {
  name: string;
  email: string;
  cellphone: string;
}

export interface PartnerSummary {
  name: string;
  age: number | null;
  university: string | null;
  major: string | null;
  photoUrl: string | null;
}

export interface MatchInviteNotification {
  recipient: Recipient;
  partner: PartnerSummary;
  availabilityUrl: string;
  expiresInDays: number;
}

export interface DateProposalNotification {
  recipient: Recipient;
  partnerName: string;
  whenText: string;
  venueName: string;
  venueAddress: string;
}

export interface MoreAvailabilityNotification {
  recipient: Recipient;
  partnerName: string;
  availabilityUrl: string;
}

type PartnerProfile = {
  name: string;
  dateOfBirth: Date;
  university: string;
  major: string;
  photos: { url: string; isPrimary: boolean }[];
} | null;

// Same display rules as MatchesService.toPartner: primary photo falls back to
// the first one; a missing profile falls back to a generic name.
export function buildPartnerSummary(profile: PartnerProfile): PartnerSummary {
  if (!profile) {
    return {
      name: 'tu match',
      age: null,
      university: null,
      major: null,
      photoUrl: null,
    };
  }
  const primary =
    profile.photos.find((photo) => photo.isPrimary) ?? profile.photos[0];
  return {
    name: profile.name,
    age: ageFrom(profile.dateOfBirth),
    university: profile.university,
    major: profile.major,
    photoUrl: primary?.url ?? null,
  };
}

function ageFrom(dateOfBirth: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const monthDelta = now.getMonth() - dateOfBirth.getMonth();
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && now.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }
  return age;
}
