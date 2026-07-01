import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// Seeds 5 partner venues near Universidad EAFIT (El Poblado / Av. Las Vegas,
// Medellín) so HU-06 has places to suggest. Idempotent (fixed ids + upserts).
//
// Optionally wires a "pending" match awaiting place selection for a given user
// so the dashboard redirect is testable end-to-end:
//   node dist/src/scripts/seed-places.js you@eafit.edu.co
// (the email must belong to an already-registered account). Dev only.

const PARTNER_EMAIL = 'place.partner@ces.edu.co';
const PARTNER_CELLPHONE = '+573007776655';
const SEED_MATCH_ID = 'seed-place-match';

// type/tags drive HU-06 ranking; tags are Spanish lowercase to overlap hobbies.
const VENUES = [
  {
    id: 'seed-venue-pergamino',
    name: 'Pergamino Café',
    type: 'Café',
    address: 'Cra. 37 #8A-37, El Poblado, Medellín',
    openingHours: 'Lun-Sáb 7:00-21:00, Dom 9:00-18:00',
    description: 'Café de especialidad ideal para conversar sin afán.',
    commissionRate: 0.1,
    averageSpentPerPerson: 28000,
    tags: ['café', 'estudio', 'brunch'],
  },
  {
    id: 'seed-venue-velvet',
    name: 'Café Velvet',
    type: 'Café',
    address: 'Cra. 33 #7-26, El Poblado, Medellín',
    openingHours: 'Lun-Dom 8:00-22:00',
    description: 'Café tranquilo y acogedor, perfecto para una primera cita.',
    commissionRate: 0.12,
    averageSpentPerPerson: 32000,
    tags: ['café', 'lectura', 'tranquilo'],
  },
  {
    id: 'seed-venue-cine-tesoro',
    name: 'Cine Colombia El Tesoro',
    type: 'Cine',
    address: 'CC El Tesoro, Cra. 25A #1A Sur-45, El Poblado, Medellín',
    openingHours: 'Lun-Dom 12:00-22:00',
    description: 'Salas de cine para ver el estreno del momento.',
    commissionRate: 0.08,
    averageSpentPerPerson: 30000,
    tags: ['cine', 'películas', 'palomitas'],
  },
  {
    id: 'seed-venue-crepes',
    name: 'Crepes & Waffles Las Vegas',
    type: 'Restaurante',
    address: 'Av. Las Vegas #2 Sur-72, El Poblado, Medellín',
    openingHours: 'Lun-Dom 12:00-22:00',
    description: 'Crepes dulces y saladas en un ambiente relajado.',
    commissionRate: 0.1,
    averageSpentPerPerson: 40000,
    tags: ['comida', 'postres', 'cena'],
  },
  {
    id: 'seed-venue-presidenta',
    name: 'Parque de la Presidenta',
    type: 'Parque',
    address: 'Cra. 43A con Cl. 11A, El Poblado, Medellín',
    openingHours: 'Lun-Dom 6:00-18:00',
    description: 'Parque al aire libre para caminar y compartir un picnic.',
    commissionRate: 0,
    averageSpentPerPerson: 15000,
    tags: ['naturaleza', 'aire libre', 'picnic'],
  },
];

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data in production.');
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const venue of VENUES) {
      const { id, ...fields } = venue;
      await prisma.venue.upsert({
        where: { id },
        update: { ...fields, active: true },
        create: { id, ...fields, active: true },
      });
    }
    console.log(`Seeded ${VENUES.length} venues near EAFIT.`);

    const targetEmail = process.argv[2]?.trim().toLowerCase();
    if (!targetEmail) {
      console.log(
        'No email passed — skipped match seeding. To test the dashboard ' +
          'redirect: node dist/src/scripts/seed-places.js you@eafit.edu.co',
      );
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });
    if (!user) {
      console.log(
        `No registered user for ${targetEmail}. Register + finish onboarding first, then re-run.`,
      );
      return;
    }

    const partner = await prisma.user.upsert({
      where: { email: PARTNER_EMAIL },
      update: { isVerified: true },
      create: {
        email: PARTNER_EMAIL,
        cellphone: PARTNER_CELLPHONE,
        isVerified: true,
      },
    });
    const partnerProfile = await prisma.profile.upsert({
      where: { userId: partner.id },
      update: {},
      create: {
        userId: partner.id,
        name: 'Mariana',
        dateOfBirth: new Date('2002-04-18'),
        gender: 'Mujer',
        height: 168,
        biography: 'Amante del café, el cine y los parques al atardecer.',
        university: 'CES',
        major: 'Comunicación',
        semester: '7',
      },
    });

    // Hobbies that overlap the venue tags, so shared-interest ranking has signal.
    for (const name of ['Café', 'Cine', 'Lectura']) {
      const hobby = await prisma.hobby.upsert({
        where: { name },
        create: { name, category: 'general' },
        update: {},
      });
      await prisma.profileHobby.upsert({
        where: {
          profileId_hobbyId: {
            profileId: partnerProfile.id,
            hobbyId: hobby.id,
          },
        },
        create: { profileId: partnerProfile.id, hobbyId: hobby.id },
        update: {},
      });
    }

    // Pending match with no venue selections yet → dashboard redirects to HU-06.
    await prisma.match.upsert({
      where: { id: SEED_MATCH_ID },
      update: { status: 'pending', userAId: user.id, userBId: partner.id },
      create: {
        id: SEED_MATCH_ID,
        userAId: user.id,
        userBId: partner.id,
        compatibilityScore: 0.88,
        status: 'pending',
      },
    });
    // Reset any prior selections so the redirect fires on re-runs.
    await prisma.venueOption.deleteMany({ where: { matchId: SEED_MATCH_ID } });

    console.log(
      `Seeded a pending match for ${targetEmail}. Log in and open /dashboard ` +
        'to be redirected to place selection.',
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();
