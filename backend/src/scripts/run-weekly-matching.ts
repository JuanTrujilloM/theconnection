import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WeeklyMatchingService } from '../modules/matches/weekly-matching.service';
import { MatchInviteService } from '../modules/matches/match-invite.service';

// Runs one weekly matching cycle on demand instead of waiting for the Sunday
// 7pm cron, then fires the first WhatsApp notification (dev mode logs the link).
// Exercises the real DI wiring (same services the scheduler calls).
// Usage (after `npm run build`): node dist/scripts/run-weekly-matching.js
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });
  try {
    const weekly = app.get(WeeklyMatchingService);
    const pairs = await weekly.runWeeklyMatching();
    console.log(`Created ${pairs.length} match(es):`);
    for (const pair of pairs) {
      console.log(
        `  ${pair.userAId} <-> ${pair.userBId}  score=${pair.compatibilityScore}`,
      );
    }

    // Same invite step the cron runs; in dev the availability links are logged.
    const invites = app.get(MatchInviteService);
    await invites.inviteForPairs(pairs);
  } finally {
    await app.close();
  }
}

void main();
