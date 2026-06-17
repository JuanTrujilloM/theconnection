import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { VerificationCodeService } from './verification-code.service';
import { RefreshTokenService } from './refresh-token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { IsSupportedUniversityEmailConstraint } from './validators/is-supported-university-email.validator';

@Module({
  imports: [
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      // Per-token expiry is set at sign time (see AuthService.signAccessToken),
      // so the module only needs to supply the signing secret.
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    VerificationCodeService,
    RefreshTokenService,
    JwtStrategy,
    IsSupportedUniversityEmailConstraint,
  ],
})
export class AuthModule {}
