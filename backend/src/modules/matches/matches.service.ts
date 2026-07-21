import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VenuesService } from '../venues/venues.service';
import { ACTIVE_MATCH_STATUSES } from '../chatbot/user-context/match-status';
import { SUGGESTION_COUNT, MILLISECONDS_PER_WEEK } from './matches.constants';
import { MAX_COMPATIBILITY_SCORE } from './weekly-matching.constants';

type Venue = Awaited<ReturnType<VenuesService['findActive']>>[number];

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly venues: VenuesService,
  ) {}

  // Drives the dashboard: returns the active match (partner summary), or null.
  // Venue selection lives only in the tokenized flow, so no pending flag here.
  // date is present only once the match is scheduled (status 'confirmed'), so the
  // dashboard can render the confirmed-date hero without a second request.
  async getCurrentMatch(userId: string) {
    const match = await this.prisma.match.findFirst({
      where: this.activeMatchWhere(userId),
      orderBy: { createdAt: 'desc' },
      include: {
        userA: { include: { profile: { include: { photos: true } } } },
        userB: { include: { profile: { include: { photos: true } } } },
        date: { include: { venue: true } },
      },
    });
    if (!match) return null;

    const partner = match.userAId === userId ? match.userB : match.userA;
    return {
      id: match.id,
      status: match.status,
      // Raw score is 0..MAX_COMPATIBILITY_SCORE; the dashboard shows a percentage.
      compatibilityPercent: Math.round(
        Math.min(1, match.compatibilityScore / MAX_COMPATIBILITY_SCORE) * 100,
      ),
      partner: this.toPartner(partner),
      date: match.date
        ? {
            venueName: match.date.venue.name,
            address: match.date.venue.address,
            scheduledAt: match.date.scheduledAt,
          }
        : null,
    };
  }

  // Dashboard "home con contexto" counters. weeksActive is measured from the
  // user's signup so a brand-new account shows 1, not 0.
  async getStats(userId: string) {
    const [user, totalMatches, totalDates] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      }),
      this.prisma.match.count({ where: this.involvesUser(userId) }),
      this.prisma.date.count({ where: { match: this.involvesUser(userId) } }),
    ]);

    const since = user?.createdAt ?? new Date();
    const weeksActive = Math.max(
      1,
      Math.ceil((Date.now() - since.getTime()) / MILLISECONDS_PER_WEEK),
    );

    return { totalMatches, totalDates, weeksActive };
  }

  private involvesUser(userId: string) {
    return { OR: [{ userAId: userId }, { userBId: userId }] };
  }

  // HU-06: 3 places aligned with both users' shared interests. The 3 options are
  // persisted as VenueOption rows on first call and reused after, so the set
  // stays stable while each user makes their selection.
  async getVenueSuggestions(userId: string) {
    const match = await this.requireActiveMatch(userId);
    const isUserA = match.userAId === userId;

    let options = await this.prisma.venueOption.findMany({
      where: { matchId: match.id },
      include: { venue: true },
    });

    if (options.length === 0) {
      const ranked = await this.rankVenuesForMatch(
        match.userAId,
        match.userBId,
      );
      if (ranked.length < SUGGESTION_COUNT) {
        throw new BadRequestException(
          'Not enough active places to suggest. Add more in the admin panel.',
        );
      }
      // skipDuplicates + @@unique([matchId, venueId]): concurrent first calls
      // (both users opening their link at once) can't create a duplicate set.
      await this.prisma.venueOption.createMany({
        data: ranked.slice(0, SUGGESTION_COUNT).map((venue) => ({
          matchId: match.id,
          userAId: match.userAId,
          userBId: match.userBId,
          venueId: venue.id,
        })),
        skipDuplicates: true,
      });
      options = await this.prisma.venueOption.findMany({
        where: { matchId: match.id },
        include: { venue: true },
      });
    }

    return options.map((option) => ({
      ...this.toPublicVenue(option.venue),
      selected: isUserA ? option.userASelected : option.userBSelected,
    }));
  }

  // Records this user's choices on the match's VenueOption rows — a pure venue
  // write. The final venue (where both users overlap) is resolved later, by
  // MatchConfirmationService after the last flow step (availability, HU-09).
  async selectVenues(userId: string, venueIds: string[]) {
    const match = await this.requireActiveMatch(userId);
    const isUserA = match.userAId === userId;

    const options = await this.prisma.venueOption.findMany({
      where: { matchId: match.id },
    });
    const suggestedIds = new Set(options.map((option) => option.venueId));
    const allSuggested = venueIds.every((id) => suggestedIds.has(id));
    if (options.length === 0 || !allSuggested) {
      throw new BadRequestException(
        'You can only select among your suggested places.',
      );
    }

    // Re-selection safe: chosen rows flip on, the rest off for this user.
    const select = venueIds;
    await this.prisma.$transaction([
      this.prisma.venueOption.updateMany({
        where: { matchId: match.id, venueId: { in: select } },
        data: isUserA ? { userASelected: true } : { userBSelected: true },
      }),
      this.prisma.venueOption.updateMany({
        where: { matchId: match.id, venueId: { notIn: select } },
        data: isUserA ? { userASelected: false } : { userBSelected: false },
      }),
    ]);

    return { selectedVenueIds: select };
  }

  // Ranking: more shared-interest tag hits first; cheaper venue, then name, as
  // deterministic tie-breakers so the same match always sees the same 3.
  private async rankVenuesForMatch(
    userAId: string,
    userBId: string,
  ): Promise<Venue[]> {
    const shared = await this.sharedInterests(userAId, userBId);
    const venues = await this.venues.findActive();
    return [...venues].sort((a, b) => {
      const score = this.tagScore(b, shared) - this.tagScore(a, shared);
      if (score !== 0) return score;
      const spend = a.averageSpentPerPerson - b.averageSpentPerPerson;
      if (spend !== 0) return spend;
      return a.name.localeCompare(b.name);
    });
  }

  private tagScore(venue: Venue, shared: Set<string>): number {
    return venue.tags.filter((tag) => shared.has(tag.toLowerCase())).length;
  }

  private async sharedInterests(
    userAId: string,
    userBId: string,
  ): Promise<Set<string>> {
    const [a, b] = await Promise.all([
      this.hobbyNames(userAId),
      this.hobbyNames(userBId),
    ]);
    const other = new Set(b);
    return new Set(a.filter((name) => other.has(name)));
  }

  // Lowercased so the intersection and tag matching are case-insensitive.
  private async hobbyNames(userId: string): Promise<string[]> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { hobbies: { include: { hobby: true } } },
    });
    return profile?.hobbies.map((ph) => ph.hobby.name.toLowerCase()) ?? [];
  }

  private async requireActiveMatch(userId: string) {
    const match = await this.prisma.match.findFirst({
      where: this.activeMatchWhere(userId),
      orderBy: { createdAt: 'desc' },
    });
    if (!match) {
      throw new NotFoundException('You have no active match.');
    }
    return match;
  }

  private activeMatchWhere(userId: string) {
    return {
      OR: [{ userAId: userId }, { userBId: userId }],
      status: { in: [...ACTIVE_MATCH_STATUSES] },
    };
  }

  // Commission rate stays internal; students only see what HU-06 lists.
  private toPublicVenue(venue: Venue) {
    return {
      id: venue.id,
      name: venue.name,
      type: venue.type,
      address: venue.address,
      openingHours: venue.openingHours,
      description: venue.description,
      tags: venue.tags,
      averageSpentPerPerson: venue.averageSpentPerPerson,
    };
  }

  private toPartner(
    user: {
      profile: {
        name: string;
        dateOfBirth: Date;
        university: string;
        major: string;
        biography: string;
        photos: { url: string; isPrimary: boolean }[];
      } | null;
    } | null,
  ) {
    const profile = user?.profile;
    if (!profile) return null;
    const primary =
      profile.photos.find((photo) => photo.isPrimary) ?? profile.photos[0];
    return {
      name: profile.name,
      age: this.ageFrom(profile.dateOfBirth),
      university: profile.university,
      major: profile.major,
      biography: profile.biography,
      photoUrl: primary?.url ?? null,
    };
  }

  private ageFrom(dateOfBirth: Date): number {
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
}
