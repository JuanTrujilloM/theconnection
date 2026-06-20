import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';

export type VerificationResult =
  | 'ok'
  | 'not_found'
  | 'expired'
  | 'too_many_attempts'
  | 'mismatch';

const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const SALT_ROUNDS = 10;

@Injectable()
export class VerificationCodeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // One active code per user: drop the previous one, persist only the bcrypt hash.
  // Plaintext is returned so the caller can mail it; it never hits the DB.
  async issueForUser(userId: string): Promise<string> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = await bcrypt.hash(code, SALT_ROUNDS);

    await this.prisma.emailVerificationCode.deleteMany({
      where: { userId, consumedAt: null },
    });
    await this.prisma.emailVerificationCode.create({
      data: { userId, codeHash, expiresAt: this.computeExpiry() },
    });

    return code;
  }

  // Returns a result enum instead of throwing — AuthService maps it to HTTP.
  async validate(userId: string, code: string): Promise<VerificationResult> {
    const record = await this.prisma.emailVerificationCode.findFirst({
      where: { userId, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return 'not_found';
    if (record.expiresAt.getTime() < Date.now()) return 'expired';
    if (record.attempts >= MAX_ATTEMPTS) return 'too_many_attempts';

    const matches = await bcrypt.compare(code, record.codeHash);
    if (!matches) {
      // Count the miss; MAX_ATTEMPTS locks the code against brute force.
      await this.prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return 'mismatch';
    }

    // Single-use: consuming drops it from the active-code queries above.
    await this.prisma.emailVerificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
    return 'ok';
  }

  // A consumed code is the de-facto "email verified" flag (no boolean column).
  async hasVerifiedEmail(userId: string): Promise<boolean> {
    const consumed = await this.prisma.emailVerificationCode.findFirst({
      where: { userId, consumedAt: { not: null } },
      select: { id: true },
    });
    return consumed !== null;
  }

  // Seconds left on the resend cooldown; 0 means a new code can go out now.
  async getSecondsUntilResendAllowed(userId: string): Promise<number> {
    const latest = await this.prisma.emailVerificationCode.findFirst({
      where: { userId, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!latest) return 0;

    const elapsed = (Date.now() - latest.createdAt.getTime()) / 1000;
    return Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed));
  }

  // For simplicity, the TTL is computed here and baked into the DB record; no background cleanup.
  private computeExpiry(): Date {
    const ttlMinutes = Number(
      this.config.get<string>('EMAIL_CODE_TTL_MINUTES') ?? 10,
    );
    return new Date(Date.now() + ttlMinutes * 60 * 1000);
  }
}
