import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter!: nodemailer.Transporter;
  private readonly from: string;
  // When SMTP is not configured we run in "dev" mode: emails are logged, not sent.
  private readonly devMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>(
      'MAIL_FROM',
      'TheConnection <no-reply@theconnection.co>',
    );
    this.devMode = !this.config.get<string>('SMTP_HOST');
  }

  onModuleInit() {
    this.transporter = this.devMode
      ? nodemailer.createTransport({ jsonTransport: true })
      : nodemailer.createTransport({
          host: this.config.get<string>('SMTP_HOST'),
          port: Number(this.config.get<string>('SMTP_PORT') ?? 587),
          secure: this.config.get<string>('SMTP_SECURE') === 'true',
          auth: {
            user: this.config.get<string>('SMTP_USER'),
            pass: this.config.get<string>('SMTP_PASS'),
          },
        });
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    if (this.devMode) {
      this.logger.warn(
        `[dev mail] verification code for ${email}: ${code} (SMTP not configured)`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: 'Your TheConnection verification code',
      html: this.buildVerificationHtml(code),
    });
  }

  private buildVerificationHtml(code: string): string {
    return `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your university email</h2>
        <p>Use the code below to finish creating your TheConnection account:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</p>
        <p style="color: #666;">This code expires in a few minutes. If you didn't request it, you can ignore this email.</p>
      </div>
    `;
  }
}
