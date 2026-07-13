import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { isAdminEmail } from '../constants/admin';
import type { AuthenticatedUser } from '../../modules/auth/strategies/jwt.strategy';

// Runs after JwtAuthGuard, so request.user is populated. Gates admin-only routes
// against the ADMIN_EMAILS allowlist.
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user || !isAdminEmail(user.email)) {
      throw new ForbiddenException('Admin access required.');
    }
    return true;
  }
}
