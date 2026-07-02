import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WeeklyMatchingService } from '../modules/matches/weekly-matching.service';

// Runs one weekly matching cycle on demand instead of waiting for the Sunday
// 7pm cron. Exercises the real DI wiring (same service the scheduler calls).
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
  } finally {
    await app.close();
  }
}

void main();
