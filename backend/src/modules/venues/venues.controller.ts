import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

// Venue management — restricted to ADMIN_EMAILS via AdminGuard (runs after JWT).
@Controller('admin/venues')
@UseGuards(JwtAuthGuard, AdminGuard)
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Get()
  findAll() {
    return this.venuesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateVenueDto) {
    return this.venuesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVenueDto) {
    return this.venuesService.update(id, dto);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.venuesService.deactivate(id);
  }
}
