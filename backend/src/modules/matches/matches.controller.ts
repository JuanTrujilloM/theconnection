import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { MatchesService } from './matches.service';
import { SelectVenuesDto } from './dto/select-venues.dto';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('current')
  getCurrent(@CurrentUser() user: AuthenticatedUser) {
    return this.matchesService.getCurrentMatch(user.userId);
  }

  @Get('current/venue-suggestions')
  getVenueSuggestions(@CurrentUser() user: AuthenticatedUser) {
    return this.matchesService.getVenueSuggestions(user.userId);
  }

  @Post('current/venue-selection')
  selectVenues(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SelectVenuesDto,
  ) {
    return this.matchesService.selectVenues(user.userId, dto.venueIds);
  }
}
