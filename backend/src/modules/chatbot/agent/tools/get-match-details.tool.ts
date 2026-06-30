import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../config/prisma.service';
import {
  ACTIVE_MATCH_STATUSES,
  matchStatusLabel,
} from '../../user-context/match-status';

// AC #4: the user's current match. Returns ONLY the partner's public-facing
// fields — this minimization is the privacy boundary, not just prompt text.
@Injectable()
export class GetMatchDetailsTool {
  constructor(private readonly prisma: PrismaService) {}

  async run(userId: string): Promise<string> {
    const match = await this.prisma.match.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: { in: [...ACTIVE_MATCH_STATUSES] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        userA: { include: { profile: true } },
        userB: { include: { profile: true } },
        date: true,
      },
    });

    const partner = match
      ? match.userAId === userId
        ? match.userB
        : match.userA
      : null;
    if (!match || !partner?.profile) return 'NO_ACTIVE_MATCH';

    const hasConfirmedDate = match.date?.status === 'confirmed';
    return JSON.stringify({
      name: partner.profile.name,
      university: partner.profile.university,
      major: partner.profile.major,
      bio: partner.profile.biography,
      status: matchStatusLabel(match.status, hasConfirmedDate),
    });
  }
}
