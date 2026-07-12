import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../config/prisma.service';

export type LinkStep = 'AVAILABILITY' | 'VENUE';

export interface ValidatedLink {
  id: string;
  matchId: string;
  userId: string;
  step: LinkStep;
}

// Result-enum instead of throwing: the controller maps each reason to HTTP.
export type LinkValidation =
  | { status: 'ok'; link: ValidatedLink }
  | { status: 'invalid' | 'expired' | 'consumed' };

const DEFAULT_TTL_HOURS = 72;

@Injectable()
export class AvailabilityLinkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // Opaque token; DB keeps only its hash. Plaintext is returned so the caller
  // can build the WhatsApp URL — it never hits the DB. One link per (match,user):
  // re-issuing drops the previous row (@@unique), so an old link stops working.
  async issueForMatchUser(matchId: string, userId: string): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    await this.prisma.availabilityLink.deleteMany({
      where: { matchId, userId },
    });
    await this.prisma.availabilityLink.create({
      data: {
        matchId,
        userId,
        tokenHash: this.hash(token),
        expiresAt: this.computeExpiry(),
      },
    });
    return token;
  }

  async validate(token: string): Promise<LinkValidation> {
    const record = await this.prisma.availabilityLink.findUnique({
      where: { tokenHash: this.hash(token) },
    });

    if (!record) return { status: 'invalid' };
    if (record.consumedAt) return { status: 'consumed' };
    if (record.expiresAt.getTime() < Date.now()) return { status: 'expired' };

    return {
      status: 'ok',
      link: {
        id: record.id,
        matchId: record.matchId,
        userId: record.userId,
        step: record.step as LinkStep,
      },
    };
  }

  // Availability saved -> the same link now serves the place-selection step (HU-06).
  async advanceToVenue(linkId: string): Promise<void> {
    await this.prisma.availabilityLink.update({
      where: { id: linkId },
      data: { step: 'VENUE' },
    });
  }

  // Flow finished; a consumed link reads as "already used" on re-open (AC #5).
  // updateMany (not update) so it's a no-op if the row was already replaced by a
  // re-issued link (e.g. an HU-08 "add more availability" nudge fired first).
  async consume(linkId: string): Promise<void> {
    await this.prisma.availabilityLink.updateMany({
      where: { id: linkId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
  }

  // sha256, not bcrypt: 256-bit tokens are brute-force-proof, and a deterministic
  // hash lets us look them up by equality (findUnique on tokenHash).
  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private computeExpiry(): Date {
    const hours = Number(
      this.config.get<string>('AVAILABILITY_LINK_TTL_HOURS') ??
        DEFAULT_TTL_HOURS,
    );
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }
}
