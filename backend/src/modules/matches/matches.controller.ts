import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { MatchesService } from './matches.service';

// Venue suggestion/selection has no authenticated endpoints: it runs only in
// the public tokenized flow (availability module), like time selection.
@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('current')
  getCurrent(@CurrentUser() user: AuthenticatedUser) {
    return this.matchesService.getCurrentMatch(user.userId);
  }
}
