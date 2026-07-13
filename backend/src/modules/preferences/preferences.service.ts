import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { DEFAULT_HOBBY_CATEGORY } from './constants/preferences-options';
import { CreatePreferencesDto } from './dto/create-preferences.dto';

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  // Pre-fills the edit form. Hobbies live on the profile (ProfileHobby), not on
  // Preferences, so they're joined in and flattened to names.
  async getByUserId(userId: string) {
    const preferences = await this.prisma.preferences.findUnique({
      where: { userId },
    });
    if (!preferences) return null;

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { hobbies: { include: { hobby: true } } },
    });

    return {
      ...preferences,
      hobbies: profile?.hobbies.map((entry) => entry.hobby.name) ?? [],
    };
  }

  // HU-03: persist preferences + hobbies. Onboarding is considered complete once
  // both the profile and preferences exist (derived in AuthService), so there is
  // no flag to flip here. Requires an existing profile (HU-02 runs first).
  async save(userId: string, dto: CreatePreferencesDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new BadRequestException('Complete your profile before continuing.');
    }
    if (dto.ageRange.min >= dto.ageRange.max) {
      throw new BadRequestException('Invalid age range.');
    }

    const data = {
      relationshipType: dto.relationshipType,
      orientation: dto.orientation,
      minAge: dto.ageRange.min,
      maxAge: dto.ageRange.max,
      genderInterest: dto.genderInterest,
      sameUniversity: dto.sameUniversity,
      heightRange: dto.heightRange,
      // Stored as a single string per the data model (comma-separated tags).
      energyVibe: dto.energyVibe.join(', '),
    };

    // De-dupe so repeated tags don't violate the ProfileHobby unique constraint.
    const hobbyNames = [
      ...new Set(dto.hobbies.map((name) => name.trim())),
    ].filter(Boolean);

    return this.prisma.$transaction(async (tx) => {
      await tx.preferences.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data,
      });

      // Replace the hobby set on each submit.
      await tx.profileHobby.deleteMany({ where: { profileId: profile.id } });
      for (const name of hobbyNames) {
        const hobby = await tx.hobby.upsert({
          where: { name },
          create: { name, category: DEFAULT_HOBBY_CATEGORY },
          update: {},
        });
        await tx.profileHobby.create({
          data: { profileId: profile.id, hobbyId: hobby.id },
        });
      }

      return tx.preferences.findUniqueOrThrow({ where: { userId } });
    });
  }
}
