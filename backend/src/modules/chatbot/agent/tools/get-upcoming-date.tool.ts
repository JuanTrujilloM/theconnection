import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../config/prisma.service';

// AC #5: the user's confirmed upcoming date. Returns place/address/time plus the
// match's first name only — never the partner's contact details.
@Injectable()
export class GetUpcomingDateTool {
  constructor(private readonly prisma: PrismaService) {}

  async run(userId: string): Promise<string> {
    const match = await this.prisma.match.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: 'confirmed',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        userA: { include: { profile: true } },
        userB: { include: { profile: true } },
        date: { include: { venue: true } },
      },
    });

    // A date exists and is in the future = scheduled. The date's status word
    // doesn't gate this; the match query already limits to confirmed matches.
    const date = match?.date;
    if (!match || !date || date.scheduledAt <= new Date()) {
      return 'NO_DATE_SCHEDULED';
    }

    const partner = match.userAId === userId ? match.userB : match.userA;
    return JSON.stringify({
      matchName: partner.profile?.name ?? 'tu match',
      venue: date.venue.name,
      address: date.venue.address,
      scheduledAt: date.scheduledAt.toISOString(),
    });
  }
}
