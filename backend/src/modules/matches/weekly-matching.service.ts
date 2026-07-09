import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../config/prisma.service';
import { ACTIVE_MATCH_STATUSES } from '../chatbot/user-context/match-status';
import {
  GENERATED_MATCH_STATUS,
  WEEKLY_MATCHING_CRON,
  WEEKLY_MATCHING_TIMEZONE,
} from './weekly-matching.constants';
import { stableMatch } from './engine/stable-matching';
import { MatchCandidate, MatchPair } from './engine/types';

// Spanish + generic stop words dropped from biographies so the overlap signal
// keys on meaningful words, not filler.
const BIO_STOP_WORDS = new Set([
  'que',
  'los',
  'las',
  'una',
  'uno',
  'con',
  'por',
  'para',
  'del',
  'este',
  'esta',
  'como',
  'más',
  'mas',
  'pero',
  'muy',
  'and',
  'the',
  'soy',
  'amo',
]);

@Injectable()
export class WeeklyMatchingService {
  private readonly logger = new Logger(WeeklyMatchingService.name);

  constructor(private readonly prisma: PrismaService) {}

  // HU-04: the weekly cron. Colombia has no DST so America/Bogota is stable.
  @Cron(WEEKLY_MATCHING_CRON, { timeZone: WEEKLY_MATCHING_TIMEZONE })
  async handleWeeklyCron(): Promise<void> {
    const created = await this.runWeeklyMatching();
    this.logger.log(`Weekly matching created ${created.length} match(es).`);
  }

  // Load pool -> run pure engine -> persist. Public so ops/tests can invoke it
  // without waiting for the scheduler. Returns the created pairs.
  async runWeeklyMatching(): Promise<MatchPair[]> {
    const candidates = await this.loadCandidates();
    const pairs = stableMatch(candidates);
    await this.persist(pairs);
    return pairs;
  }

  // Eligible pool: verified, SEARCHING, fully onboarded, and not already holding
  // an active match. The last filter makes a double cron-fire idempotent.
  private async loadCandidates(): Promise<MatchCandidate[]> {
    const busyUserIds = await this.usersWithActiveMatch();

    const users = await this.prisma.user.findMany({
      where: {
        isVerified: true,
        id: { notIn: [...busyUserIds] },
        // SEARCHING = actively looking (Profile.status default); PAUSED opts out.
        profile: { is: { status: 'SEARCHING' } },
        preferences: { isNot: null },
      },
      include: {
        profile: { include: { hobbies: { include: { hobby: true } } } },
        preferences: true,
      },
    });

    const userIds = users.map((user) => user.id);
    const [priorPartners, reliability] = await Promise.all([
      this.priorPartnersByUser(userIds),
      this.reliabilityByUser(userIds),
    ]);

    return users
      .filter((user) => user.profile && user.preferences)
      .map((user) =>
        this.toCandidate(
          user,
          priorPartners.get(user.id) ?? new Set(),
          reliability.get(user.id) ?? 0,
        ),
      );
  }

  private async usersWithActiveMatch(): Promise<Set<string>> {
    const active = await this.prisma.match.findMany({
      where: { status: { in: [...ACTIVE_MATCH_STATUSES] } },
      select: { userAId: true, userBId: true },
    });
    const busy = new Set<string>();
    for (const match of active) {
      busy.add(match.userAId);
      busy.add(match.userBId);
    }
    return busy;
  }

  // Every past partner of each user, from any week, to enforce "no repeats".
  private async priorPartnersByUser(
    userIds: string[],
  ): Promise<Map<string, Set<string>>> {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ userAId: { in: userIds } }, { userBId: { in: userIds } }],
      },
      select: { userAId: true, userBId: true },
    });
    const map = new Map<string, Set<string>>();
    const add = (owner: string, partner: string) => {
      const set = map.get(owner) ?? new Set<string>();
      set.add(partner);
      map.set(owner, set);
    };
    for (const match of matches) {
      add(match.userAId, match.userBId);
      add(match.userBId, match.userAId);
    }
    return map;
  }

  // Reliability in [-1,1]: (attended - missed) / total past dates (AC #9).
  private async reliabilityByUser(
    userIds: string[],
  ): Promise<Map<string, number>> {
    const feedbacks = await this.prisma.feedback.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, occurred: true },
    });
    const totals = new Map<string, { attended: number; total: number }>();
    for (const feedback of feedbacks) {
      const entry = totals.get(feedback.userId) ?? { attended: 0, total: 0 };
      entry.total += 1;
      if (feedback.occurred) entry.attended += 1;
      totals.set(feedback.userId, entry);
    }
    const map = new Map<string, number>();
    for (const [userId, { attended, total }] of totals) {
      map.set(userId, (2 * attended - total) / total);
    }
    return map;
  }

  private async persist(pairs: MatchPair[]): Promise<void> {
    if (pairs.length === 0) return;
    await this.prisma.match.createMany({
      data: pairs.map((pair) => ({
        userAId: pair.userAId,
        userBId: pair.userBId,
        compatibilityScore: pair.compatibilityScore,
        status: GENERATED_MATCH_STATUS,
      })),
    });
  }

  private toCandidate(
    user: LoadedUser,
    priorPartnerIds: Set<string>,
    reliability: number,
  ): MatchCandidate {
    const profile = user.profile!;
    const preferences = user.preferences!;
    return {
      userId: user.id,
      gender: profile.gender,
      genderInterest: preferences.genderInterest,
      age: ageFrom(profile.dateOfBirth),
      minAge: preferences.minAge,
      maxAge: preferences.maxAge,
      university: profile.university,
      requiresSameUniversity: preferences.sameUniversity,
      relationshipType: preferences.relationshipType,
      major: profile.major,
      semester: profile.semester,
      height: profile.height,
      heightRange: preferences.heightRange,
      // energyVibe is stored CSV-joined by the preferences service; split back.
      vibes: splitCsv(preferences.energyVibe),
      hobbies: profile.hobbies.map((entry) => entry.hobby.name.toLowerCase()),
      biographyTokens: tokenizeBiography(profile.biography),
      reliability,
      priorPartnerIds,
    };
  }
}

// Shape returned by loadCandidates' Prisma query; kept local to the service.
type LoadedUser = {
  id: string;
  profile: {
    gender: string;
    dateOfBirth: Date;
    university: string;
    major: string;
    semester: string;
    height: number;
    biography: string;
    hobbies: { hobby: { name: string } }[];
  } | null;
  preferences: {
    genderInterest: string;
    minAge: number;
    maxAge: number;
    sameUniversity: boolean;
    relationshipType: string;
    heightRange: string;
    energyVibe: string;
  } | null;
};

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0);
}

function tokenizeBiography(biography: string): string[] {
  const tokens = biography
    .toLowerCase()
    .split(/[^a-záéíóúñü]+/i)
    .filter((word) => word.length > 2 && !BIO_STOP_WORDS.has(word));
  return [...new Set(tokens)];
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
