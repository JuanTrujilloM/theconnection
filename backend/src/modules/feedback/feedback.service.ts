import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  // HU-10: the date the dashboard should ask about — already happened, and this
  // user hasn't answered yet. `feedbacks: { none }` scopes "answered" to this
  // user, so each partner is prompted independently.
  async getPending(userId: string) {
    const date = await this.prisma.date.findFirst({
      where: {
        scheduledAt: { lt: new Date() },
        match: this.involvesUser(userId),
        feedbacks: { none: { userId } },
      },
      orderBy: { scheduledAt: 'desc' },
      include: {
        venue: true,
        match: {
          include: {
            userA: { include: { profile: true } },
            userB: { include: { profile: true } },
          },
        },
      },
    });
    if (!date) return null;

    const partner =
      date.match.userAId === userId ? date.match.userB : date.match.userA;
    return {
      dateId: date.id,
      partnerName: partner.profile?.name ?? null,
      venueName: date.venue.name,
      scheduledAt: date.scheduledAt,
    };
  }

  async submit(userId: string, dto: CreateFeedbackDto) {
    const date = await this.prisma.date.findUnique({
      where: { id: dto.dateId },
      include: { match: true },
    });
    if (!date) throw new NotFoundException('Date not found.');

    const involved =
      date.match.userAId === userId || date.match.userBId === userId;
    if (!involved) {
      throw new ForbiddenException('This date is not yours.');
    }

    // One feedback per user per date (HU-10). The check also blocks a second
    // submission after the window would have closed.
    const existing = await this.prisma.feedback.findFirst({
      where: { dateId: dto.dateId, userId },
    });
    if (existing) {
      throw new ConflictException('You already gave feedback for this date.');
    }

    // rating/amountSpent only apply when the date happened; drop them otherwise
    // so a "didn't happen" answer can't carry a stray score.
    const occurred = dto.occurred;
    await this.prisma.feedback.create({
      data: {
        dateId: dto.dateId,
        userId,
        occurred,
        rating: occurred ? (dto.rating ?? null) : null,
        comments: dto.comments ?? null,
        noShowReason: occurred ? null : (dto.noShowReason ?? null),
        amountSpent: occurred ? (dto.amountSpent ?? null) : null,
      },
    });

    return { ok: true };
  }

  private involvesUser(userId: string) {
    return { OR: [{ userAId: userId }, { userBId: userId }] };
  }
}
