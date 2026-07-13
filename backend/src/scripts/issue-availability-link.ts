import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../config/prisma.service';
import { MatchInviteService } from '../modules/matches/match-invite.service';

// Re-issues and prints the flow links (HU-06 places -> HU-09 availability) for
// a match, without re-running the whole weekly matcher. Handy for iterating on
// the frontend flow or regenerating a link after it was consumed/expired.
// Note: re-issued links restart at the VENUE step, even after an HU-08 nudge.
// Usage (after `npm run build`):
//   node dist/scripts/issue-availability-link.js            # latest match
//   node dist/scripts/issue-availability-link.js <matchId>  # a specific match
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });
  try {
    const prisma = app.get(PrismaService);
    const invites = app.get(MatchInviteService);

    const matchId = process.argv[2] ?? (await latestMatchId(prisma));
    if (!matchId) {
      console.error('No match found. Run the weekly matching first.');
      return;
    }

    const results = await invites.inviteForMatch(matchId);
    if (results.length === 0) {
      console.error(`No users to invite for match ${matchId}.`);
      return;
    }

    console.log(`Availability links for match ${matchId}:`);
    for (const result of results) {
      console.log(`  user ${result.userId} (${result.cellphone}):`);
      console.log(`    ${result.url}`);
    }
  } finally {
    await app.close();
  }
}

async function latestMatchId(prisma: PrismaService): Promise<string | null> {
  const match = await prisma.match.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });
  return match?.id ?? null;
}

void main();
