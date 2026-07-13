import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { PreferencesService } from './preferences.service';
import { CreatePreferencesDto } from './dto/create-preferences.dto';

@Controller('preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get('me')
  getMine(@CurrentUser() user: AuthenticatedUser) {
    return this.preferencesService.getByUserId(user.userId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePreferencesDto,
  ) {
    return this.preferencesService.save(user.userId, dto);
  }
}
