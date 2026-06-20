import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../config/prisma.service';

export type RotationResult =
  | { status: 'ok'; userId: string; token: string }
  | { status: 'invalid' }
  | { status: 'expired' }
  | { status: 'reuse_detected'; userId: string };

const DEFAULT_TTL_DAYS = 30;

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // Opaque token; DB keeps only its hash. Plaintext is returned for the cookie.
  // No wipe of previous tokens — a user can hold several (one per device).
  async issueForUser(userId: string): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hash(token),
        expiresAt: this.computeExpiry(),
      },
    });
    return token;
  }

  // Single-use: revoke the presented token and issue a fresh one.
  async rotate(token: string): Promise<RotationResult> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hash(token) },
    });

    if (!record) return { status: 'invalid' };
    // Already revoked but presented again = stolen & replayed. Caller revokes the family.
    if (record.revokedAt) {
      return { status: 'reuse_detected', userId: record.userId };
    }
    if (record.expiresAt.getTime() < Date.now()) return { status: 'expired' };

    // Revoke-old + issue-new must be atomic, or a crash mid-way orphans the session.
    const next = randomBytes(32).toString('base64url');
    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
      }),
      this.prisma.refreshToken.create({
        data: {
          userId: record.userId,
          tokenHash: this.hash(next),
          expiresAt: this.computeExpiry(),
        },
      }),
    ]);

    return { status: 'ok', userId: record.userId, token: next };
  }

  // Logout on this device. updateMany (not update) so an unknown token is a no-op.
  async revoke(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hash(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // Logout everywhere — used on reuse detection and global sign-out.
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // sha256, not bcrypt: 256-bit tokens are brute-force-proof, and a deterministic
  // hash lets us look them up by equality (findUnique on tokenHash).
  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  // For simplicity, the TTL is computed here and baked into the DB record; no background cleanup.
  private computeExpiry(): Date {
    const days = Number(
      this.config.get<string>('JWT_REFRESH_EXPIRES_DAYS') ?? DEFAULT_TTL_DAYS,
    );
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
}
