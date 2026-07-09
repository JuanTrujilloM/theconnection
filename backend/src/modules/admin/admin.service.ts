import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

// Read + light-management surface for the admin panel. One query per list; the
// panel is low-traffic and unpaginated, so tallying in memory is fine at launch
// cohort size. All routes are gated by JwtAuthGuard + AdminGuard in the module.
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // Users: profile summary + how many matches each has taken part in.
  async listUsers() {
    const [users, matches] = await Promise.all([
      this.prisma.user.findMany({
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.match.findMany({ select: { userAId: true, userBId: true } }),
    ]);

    const matchCount = new Map<string, number>();
    for (const match of matches) {
      matchCount.set(match.userAId, (matchCount.get(match.userAId) ?? 0) + 1);
      matchCount.set(match.userBId, (matchCount.get(match.userBId) ?? 0) + 1);
    }

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      cellphone: user.cellphone,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      matchCount: matchCount.get(user.id) ?? 0,
      profile: user.profile
        ? {
            name: user.profile.name,
            age: ageFrom(user.profile.dateOfBirth),
            gender: user.profile.gender,
            university: user.profile.university,
            major: user.profile.major,
            semester: user.profile.semester,
            status: user.profile.status,
          }
        : null,
    }));
  }

  async setUserStatus(userId: string, status: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('This user has no profile yet.');
    }
    await this.prisma.profile.update({ where: { userId }, data: { status } });
    return { id: userId, status };
  }

  async verifyUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
    return { id: userId, isVerified: true };
  }

  // Matches: both partners (name + university) and the scheduled date if any.
  async listMatches() {
    const matches = await this.prisma.match.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        userA: { include: { profile: true } },
        userB: { include: { profile: true } },
        date: { include: { venue: true } },
      },
    });

    return matches.map((match) => ({
      id: match.id,
      status: match.status,
      compatibilityScore: match.compatibilityScore,
      createdAt: match.createdAt,
      userA: partnerSummary(match.userA),
      userB: partnerSummary(match.userB),
      date: match.date
        ? {
            scheduledAt: match.date.scheduledAt,
            status: match.date.status,
            venueName: match.date.venue.name,
          }
        : null,
    }));
  }

  // Full drill-down for one match: both users' complete profile + preferences +
  // interests + photos, plus shared interests, venue options with each side's
  // selection, availability per user, the scheduled date and any feedback.
  async getMatchDetail(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        userA: { include: { profile: profileInclude, preferences: true } },
        userB: { include: { profile: profileInclude, preferences: true } },
        date: { include: { venue: true } },
        venueOptions: { include: { venue: true } },
        availabilities: true,
      },
    });
    if (!match) {
      throw new NotFoundException('Match not found.');
    }

    const userA = mapUserDetail(match.userA);
    const userB = mapUserDetail(match.userB);

    // Feedback hangs off the Date, so only fetch it when a date exists.
    const feedback = match.date
      ? await this.prisma.feedback.findMany({
          where: { dateId: match.date.id },
          include: { user: { include: { profile: true } } },
        })
      : [];

    return {
      id: match.id,
      status: match.status,
      compatibilityScore: match.compatibilityScore,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      userA,
      userB,
      sharedHobbies: intersection(userA.hobbies, userB.hobbies),
      venueOptions: match.venueOptions.map((option) => ({
        venueName: option.venue.name,
        type: option.venue.type,
        userASelected: option.userASelected,
        userBSelected: option.userBSelected,
      })),
      availability: {
        userA: availabilityFor(match.availabilities, match.userAId),
        userB: availabilityFor(match.availabilities, match.userBId),
      },
      date: match.date
        ? {
            venueName: match.date.venue.name,
            address: match.date.venue.address,
            scheduledAt: match.date.scheduledAt,
            status: match.date.status,
          }
        : null,
      feedback: feedback.map((entry) => ({
        userName: entry.user.profile?.name ?? entry.user.email,
        occurred: entry.occurred,
        rating: entry.rating,
        comments: entry.comments,
        noShowReason: entry.noShowReason,
        amountSpent: entry.amountSpent,
      })),
    };
  }

  async cancelMatch(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) {
      throw new NotFoundException('Match not found.');
    }
    await this.prisma.match.update({
      where: { id: matchId },
      data: { status: 'canceled' },
    });
    return { id: matchId, status: 'canceled' };
  }

  // Post-date feedback (HU-10) with who left it and where the date was.
  async listFeedback() {
    const feedback = await this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { include: { profile: true } },
        date: { include: { venue: true } },
      },
    });

    return feedback.map((entry) => ({
      id: entry.id,
      occurred: entry.occurred,
      rating: entry.rating,
      comments: entry.comments,
      noShowReason: entry.noShowReason,
      amountSpent: entry.amountSpent,
      createdAt: entry.createdAt,
      userName: entry.user.profile?.name ?? entry.user.email,
      venueName: entry.date.venue.name,
      scheduledAt: entry.date.scheduledAt,
    }));
  }

  // Safety reports between users (moderation queue).
  async listReports() {
    const reports = await this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        userA: { include: { profile: true } },
        userB: { include: { profile: true } },
      },
    });

    return reports.map((report) => ({
      id: report.id,
      createdAt: report.createdAt,
      reporter: partnerSummary(report.userA),
      reported: partnerSummary(report.userB),
    }));
  }
}

type UserWithProfile = {
  id: string;
  email: string;
  profile: { name: string; university: string } | null;
};

function partnerSummary(user: UserWithProfile) {
  return {
    id: user.id,
    name: user.profile?.name ?? user.email,
    university: user.profile?.university ?? '—',
  };
}

// Prisma include reused for both users in the detail query.
const profileInclude = {
  include: { photos: true, hobbies: { include: { hobby: true } } },
} as const;

type DetailUser = {
  id: string;
  email: string;
  isVerified: boolean;
  profile: {
    name: string;
    dateOfBirth: Date;
    gender: string;
    height: number;
    biography: string;
    university: string;
    major: string;
    semester: string;
    status: string;
    photos: { url: string; isPrimary: boolean }[];
    hobbies: { hobby: { name: string } }[];
  } | null;
  preferences: {
    relationshipType: string;
    orientation: string;
    minAge: number;
    maxAge: number;
    genderInterest: string;
    sameUniversity: boolean;
    heightRange: string;
    energyVibe: string;
  } | null;
};

// Flattens one side of a match into the shape the comparison view renders.
function mapUserDetail(user: DetailUser) {
  const profile = user.profile;
  const photos = profile?.photos ?? [];
  const primary = photos.find((photo) => photo.isPrimary) ?? photos[0];
  return {
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    name: profile?.name ?? user.email,
    age: profile ? ageFrom(profile.dateOfBirth) : null,
    gender: profile?.gender ?? null,
    height: profile?.height ?? null,
    biography: profile?.biography ?? null,
    university: profile?.university ?? null,
    major: profile?.major ?? null,
    semester: profile?.semester ?? null,
    status: profile?.status ?? null,
    primaryPhoto: primary?.url ?? null,
    photos: photos.map((photo) => photo.url),
    hobbies: profile?.hobbies.map((entry) => entry.hobby.name) ?? [],
    preferences: user.preferences
      ? {
          relationshipType: user.preferences.relationshipType,
          orientation: user.preferences.orientation,
          minAge: user.preferences.minAge,
          maxAge: user.preferences.maxAge,
          genderInterest: user.preferences.genderInterest,
          sameUniversity: user.preferences.sameUniversity,
          heightRange: user.preferences.heightRange,
          energyVibe: user.preferences.energyVibe,
        }
      : null,
  };
}

// Case-insensitive intersection, preserving the first list's original casing.
function intersection(a: string[], b: string[]): string[] {
  const other = new Set(b.map((item) => item.toLowerCase()));
  return a.filter((item) => other.has(item.toLowerCase()));
}

function availabilityFor(
  rows: { userId: string; date: Date; timeSlot: string }[],
  userId: string,
) {
  return rows
    .filter((row) => row.userId === userId)
    .map((row) => ({ date: row.date, timeSlot: row.timeSlot }));
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
