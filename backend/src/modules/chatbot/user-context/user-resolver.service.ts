import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../config/prisma.service';

// Compact, chatbot-facing view of the current user. Drives both the greeting
// (name) and the personalization of dating tips (interests, preferences).
export interface ChatUserContext {
  userId: string;
  name: string;
  age: number | null;
  university: string | null;
  major: string | null;
  semester: string | null;
  interests: string[];
  relationshipType: string | null;
  orientation: string | null;
  energyVibe: string | null;
}

export type ResolveResult =
  | { status: 'ok'; userId: string; context: ChatUserContext }
  | { status: 'unregistered' }
  | { status: 'unverified' };

@Injectable()
export class UserResolverService {
  constructor(private readonly prisma: PrismaService) {}

  // Resolves the WhatsApp sender by cellphone. Unknown number or unverified
  // account short-circuits the brain before any LLM call (AC #8).
  async resolve(cellphone: string): Promise<ResolveResult> {
    const user = await this.prisma.user.findUnique({
      where: { cellphone },
      include: {
        profile: { include: { hobbies: { include: { hobby: true } } } },
        preferences: true,
      },
    });

    if (!user) return { status: 'unregistered' };
    if (!user.isVerified) return { status: 'unverified' };

    return { status: 'ok', userId: user.id, context: toContext(user.id, user) };
  }
}

type LoadedUser = {
  profile: {
    name: string;
    dateOfBirth: Date;
    university: string;
    major: string;
    semester: string;
    hobbies: { hobby: { name: string } }[];
  } | null;
  preferences: {
    relationshipType: string;
    orientation: string;
    energyVibe: string;
  } | null;
};

function toContext(userId: string, user: LoadedUser): ChatUserContext {
  const profile = user.profile;
  const preferences = user.preferences;
  return {
    userId,
    // A verified user without a finished profile is rare but possible; greet generically.
    name: profile?.name ?? '',
    age: profile ? ageFromDate(profile.dateOfBirth) : null,
    university: profile?.university ?? null,
    major: profile?.major ?? null,
    semester: profile?.semester ?? null,
    interests: profile?.hobbies.map((entry) => entry.hobby.name) ?? [],
    relationshipType: preferences?.relationshipType ?? null,
    orientation: preferences?.orientation ?? null,
    energyVibe: preferences?.energyVibe ?? null,
  };
}

function ageFromDate(dateOfBirth: Date): number {
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
