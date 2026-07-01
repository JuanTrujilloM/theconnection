import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { MAX_PHOTOS } from './constants/profile-options';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  getMine(@CurrentUser() user: AuthenticatedUser) {
    return this.profileService.getByUserId(user.userId);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('photos', MAX_PHOTOS))
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProfileDto,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    return this.profileService.save(user.userId, user.email, dto, photos);
  }

  // Dashboard searching/paused toggle.
  @Patch('availability')
  setAvailability(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.profileService.setAvailability(user.userId, dto.status);
  }
}
