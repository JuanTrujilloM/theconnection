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

  /** Mints an opaque refresh token, persists its hash, and returns the plaintext. */
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

  /**
   * Validates a refresh token and rotates it: the presented token is revoked and a
   * fresh one is issued. Presenting an already-revoked token means it was stolen and
   * replayed — we surface that so the caller can revoke the whole family.
   */
  async rotate(token: string): Promise<RotationResult> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hash(token) },
    });

    if (!record) return { status: 'invalid' };
    if (record.revokedAt) {
      return { status: 'reuse_detected', userId: record.userId };
    }
    if (record.expiresAt.getTime() < Date.now()) return { status: 'expired' };

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

  /** Revokes a single token (logout on this device). No-op if it is unknown. */
  async revoke(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hash(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Revokes every active token for a user (logout everywhere / security event). */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private computeExpiry(): Date {
    const days = Number(
      this.config.get<string>('JWT_REFRESH_EXPIRES_DAYS') ?? DEFAULT_TTL_DAYS,
    );
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
}
