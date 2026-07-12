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
  // Initial links start at VENUE (places first); HU-08 nudge links are issued at
  // AVAILABILITY so the user is not walked through venues again.
  async issueForMatchUser(
    matchId: string,
    userId: string,
    step: LinkStep = 'VENUE',
  ): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    await this.prisma.availabilityLink.deleteMany({
      where: { matchId, userId },
    });
    await this.prisma.availabilityLink.create({
      data: {
        matchId,
        userId,
        step,
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

  // Moves the link to its next step (VENUE -> AVAILABILITY in the normal flow).
  async setStep(linkId: string, step: LinkStep): Promise<void> {
    await this.prisma.availabilityLink.update({
      where: { id: linkId },
      data: { step },
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

  // Public so notifications can state the real expiry ("expires in N days").
  ttlHours(): number {
    return Number(
      this.config.get<string>('AVAILABILITY_LINK_TTL_HOURS') ??
        DEFAULT_TTL_HOURS,
    );
  }

  private computeExpiry(): Date {
    return new Date(Date.now() + this.ttlHours() * 60 * 60 * 1000);
  }
}
