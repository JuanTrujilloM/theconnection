import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { StorageService } from '../storage/storage.service';
import { universityFromEmail } from '../auth/constants/university-domains';
import { MAX_PHOTOS } from './constants/profile-options';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // HU-02: create or update the current user's profile. The final photo set is
  // resolved from the ordered manifest (keep existing URLs + new uploads), so
  // editing doesn't force re-uploading photos that haven't changed.
  async save(
    userId: string,
    email: string,
    dto: CreateProfileDto,
    files: Express.Multer.File[],
  ) {
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
      include: { photos: true },
    });
    const ownedUrls = new Set(existing?.photos.map((photo) => photo.url) ?? []);

    const photoUrls = await this.resolvePhotoUrls(dto, files, ownedUrls);
    if (photoUrls.length < 1) {
      throw new BadRequestException('At least one photo is required.');
    }
    if (photoUrls.length > MAX_PHOTOS) {
      throw new BadRequestException(
        `At most ${MAX_PHOTOS} photos are allowed.`,
      );
    }

    // University is derived from the verified email; never trusted from input.
    const data = {
      name: dto.name,
      dateOfBirth: new Date(dto.dateOfBirth),
      gender: dto.gender,
      height: dto.height,
      biography: dto.biography,
      university: universityFromEmail(email),
      major: dto.major,
      semester: dto.semester,
      // availability is omitted here: new profiles default to SEARCHING and the
      // status is toggled separately from the dashboard, so editing the profile
      // must not reset it.
    };

    const saved = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data,
      });

      // Rebuild the photo set in the submitted order; the first is primary.
      await tx.photo.deleteMany({ where: { profileId: profile.id } });
      await tx.photo.createMany({
        data: photoUrls.map((url, index) => ({
          profileId: profile.id,
          url,
          isPrimary: index === 0,
        })),
      });

      return tx.profile.findUniqueOrThrow({
        where: { id: profile.id },
        include: { photos: true },
      });
    });

    // After the DB commit, delete the files of photos the user dropped so they
    // don't linger orphaned in storage. Best-effort; never fails the save.
    const kept = new Set(photoUrls);
    const removed = [...ownedUrls].filter((url) => !kept.has(url));
    await Promise.all(removed.map((url) => this.storage.deleteImage(url)));

    return saved;
  }

  // Resolves the ordered final photo URLs. `photoManifest` is a JSON array whose
  // entries are either 'new' (consume the next uploaded file) or 'keep:<url>'
  // (retain an existing photo). Falls back to "all files are new" when absent.
  private async resolvePhotoUrls(
    dto: CreateProfileDto,
    files: Express.Multer.File[],
    ownedUrls: Set<string>,
  ): Promise<string[]> {
    const manifest = this.parseManifest(dto.photoManifest);

    if (manifest.length === 0) {
      return Promise.all(
        (files ?? []).map((file) => this.storage.uploadImage(file)),
      );
    }

    const result: string[] = [];
    let fileIndex = 0;
    for (const entry of manifest) {
      if (entry === 'new') {
        const file = files?.[fileIndex++];
        if (!file) throw new BadRequestException('A photo file is missing.');
        result.push(await this.storage.uploadImage(file));
      } else if (entry.startsWith('keep:')) {
        const url = entry.slice('keep:'.length);
        // Only allow re-keeping a URL that already belongs to this profile.
        if (!ownedUrls.has(url)) {
          throw new BadRequestException('Invalid photo reference.');
        }
        result.push(url);
      }
    }
    return result;
  }

  private parseManifest(raw?: string): string[] {
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string')
        : [];
    } catch {
      return [];
    }
  }

  // Used to pre-fill the onboarding form for a returning user.
  getByUserId(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
      include: { photos: true },
    });
  }

  // Toggles the dashboard searching/paused status. Returns the updated profile so
  // the client can reflect the new state without a refetch.
  setAvailability(userId: string, availability: string) {
    return this.prisma.profile.update({
      where: { userId },
      data: { availability },
      include: { photos: true },
    });
  }
}
