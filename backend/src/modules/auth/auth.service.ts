import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../config/prisma.service';
import { MailService } from '../mail/mail.service';
import { VerificationCodeService } from './verification-code.service';
import { RefreshTokenService } from './refresh-token.service';
import { ACCESS_TOKEN_TTL } from './constants/cookie';
import { isSupportedUniversityEmail } from './constants/university-domains';
import { RegisterDto } from './dto/register.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResendCodeDto } from './dto/resend-code.dto';

type SafeUser = {
  id: string;
  email: string;
  cellphone: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Session = { accessToken: string; refreshToken: string; user: SafeUser };

const NEUTRAL_MESSAGE =
  'If the email is valid, a verification code has been sent.';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationCodes: VerificationCodeService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly mail: MailService,
    private readonly jwt: JwtService,
  ) {}

  // Onboarding: register / verify email / resend code
  async register(dto: RegisterDto): Promise<{ message: string }> {
    const email = this.normalizeEmail(dto.email);

    if (!isSupportedUniversityEmail(email)) {
      throw new BadRequestException('Only verified university emails are accepted.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing && (await this.verificationCodes.hasVerifiedEmail(existing.id))) {
      throw new ConflictException('This email is already registered.');
    }

    await this.ensureCellphoneAvailable(dto.cellphone, existing?.id);

    const user = existing
      ? await this.prisma.user.update({
          where: { id: existing.id },
          data: { cellphone: dto.cellphone },
        })
      : await this.prisma.user.create({
          data: { email, cellphone: dto.cellphone },
        });

    await this.issueAndSend(user.id, email);
    return { message: NEUTRAL_MESSAGE };
  }

  async verify(dto: VerifyCodeDto): Promise<Session> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid or expired verification code.');
    }

    const result = await this.verificationCodes.validate(user.id, dto.code);
    if (result !== 'ok') {
      throw new BadRequestException(this.messageForResult(result));
    }

    return this.issueSession(user);
  }

  // Session: refresh / logout / current user
  async refresh(refreshToken: string | undefined): Promise<Session> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token.');
    }

    const result = await this.refreshTokens.rotate(refreshToken);
    if (result.status === 'reuse_detected') {
      await this.refreshTokens.revokeAllForUser(result.userId);
      throw new UnauthorizedException('Session expired. Please log in again.');
    }
    if (result.status !== 'ok') {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: result.userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    const accessToken = await this.signAccessToken(user.id, user.email);
    return { accessToken, refreshToken: result.token, user: this.toSafeUser(user) };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (refreshToken) {
      await this.refreshTokens.revoke(refreshToken);
    }
  }

  async resend(dto: ResendCodeDto): Promise<{ message: string }> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || (await this.verificationCodes.hasVerifiedEmail(user.id))) {
      return { message: NEUTRAL_MESSAGE };
    }

    const wait = await this.verificationCodes.getSecondsUntilResendAllowed(user.id);
    if (wait > 0) {
      throw new HttpException(
        `Please wait ${wait}s before requesting another code.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.issueAndSend(user.id, email);
    return { message: NEUTRAL_MESSAGE };
  }

  async getById(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.toSafeUser(user);
  }

  // Internal helpers — token signing, mailing, validation, mapping
  private async issueSession(user: SafeUser): Promise<Session> {
    const accessToken = await this.signAccessToken(user.id, user.email);
    const refreshToken = await this.refreshTokens.issueForUser(user.id);
    return { accessToken, refreshToken, user: this.toSafeUser(user) };
  }

  private signAccessToken(userId: string, email: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId, email },
      { expiresIn: ACCESS_TOKEN_TTL },
    );
  }

  private async issueAndSend(userId: string, email: string): Promise<void> {
    const code = await this.verificationCodes.issueForUser(userId);
    await this.mail.sendVerificationCode(email, code);
  }

  private async ensureCellphoneAvailable(
    cellphone: string,
    ownerId?: string,
  ): Promise<void> {
    const owner = await this.prisma.user.findUnique({ where: { cellphone } });
    if (owner && owner.id !== ownerId) {
      throw new ConflictException('This phone number is already in use.');
    }
  }

  private messageForResult(result: string): string {
    if (result === 'too_many_attempts') {
      return 'Too many attempts. Please request a new code.';
    }
    return 'Invalid or expired verification code.';
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toSafeUser(user: SafeUser): SafeUser {
    return {
      id: user.id,
      email: user.email,
      cellphone: user.cellphone,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
