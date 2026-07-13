import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// Seeds one fully-wired demo user so every chatbot capability returns real data:
// a verified account, a profile + preferences, and a confirmed match with a
// scheduled date at a venue. Idempotent (fixed ids / upserts). Dev only.
// Usage (after `npm run build`): node dist/scripts/seed-chatbot-demo.js
const DEMO_CELLPHONE = '+573001112233';

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data in production.');
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const me = await prisma.user.upsert({
      where: { email: 'demo.me@eafit.edu.co' },
      update: { isVerified: true, cellphone: DEMO_CELLPHONE },
      create: {
        email: 'demo.me@eafit.edu.co',
        cellphone: DEMO_CELLPHONE,
        isVerified: true,
      },
    });
    const partner = await prisma.user.upsert({
      where: { email: 'demo.partner@ces.edu.co' },
      update: { isVerified: true },
      create: {
        email: 'demo.partner@ces.edu.co',
        cellphone: '+573004445566',
        isVerified: true,
      },
    });

    await prisma.profile.upsert({
      where: { userId: me.id },
      update: {},
      create: {
        userId: me.id,
        name: 'Ana',
        dateOfBirth: new Date('2002-05-10'),
        gender: 'Mujer',
        height: 165,
        biography: 'Amante del café y el cine independiente.',
        university: 'EAFIT',
        major: 'Derecho',
        semester: '6',
      },
    });
    await prisma.profile.upsert({
      where: { userId: partner.id },
      update: {},
      create: {
        userId: partner.id,
        name: 'Sofía',
        dateOfBirth: new Date('2001-03-02'),
        gender: 'Mujer',
        height: 170,
        biography: 'Corro maratones y leo de noche.',
        university: 'CES',
        major: 'Medicina',
        semester: '8',
      },
    });

    await prisma.preferences.upsert({
      where: { userId: me.id },
      update: {},
      create: {
        userId: me.id,
        relationshipType: 'Seria',
        orientation: 'Bisexual',
        minAge: 20,
        maxAge: 28,
        genderInterest: 'Todos',
        sameUniversity: false,
        heightRange: 'Indiferente',
        energyVibe: 'Tranquila',
      },
    });

    const venue = await prisma.venue.upsert({
      where: { id: 'demo-venue' },
      update: {},
      create: {
        id: 'demo-venue',
        name: 'Café Velvet',
        type: 'Café',
        address: 'Cra. 33 #7-26, El Poblado, Medellín',
        openingHours: '8:00-22:00',
        description: 'Café tranquilo, ideal para una primera cita.',
        commissionRate: 0.1,
        averageSpentPerPerson: 35000,
        active: true,
      },
    });

    await prisma.match.upsert({
      where: { id: 'demo-match' },
      update: { status: 'confirmed' },
      create: {
        id: 'demo-match',
        userAId: me.id,
        userBId: partner.id,
        compatibilityScore: 0.92,
        status: 'confirmed',
      },
    });

    // Three days out so it counts as "upcoming".
    const scheduledAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await prisma.date.upsert({
      where: { matchId: 'demo-match' },
      update: { status: 'confirmed', scheduledAt, venueId: venue.id },
      create: {
        matchId: 'demo-match',
        venueId: venue.id,
        scheduledAt,
        status: 'confirmed',
      },
    });

    console.log(`Seeded demo user. Chat as: ${DEMO_CELLPHONE}`);
    console.log(
      'Try: "hola", "dame consejos para mi cita", "¿quién es mi match?", "¿dónde es mi cita?"',
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();
