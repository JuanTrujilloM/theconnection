import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  // Admin list — includes inactive venues so they can be reactivated.
  findAll() {
    return this.prisma.venue.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // Pool the HU-06 suggestion algorithm draws from.
  findActive() {
    return this.prisma.venue.findMany({ where: { active: true } });
  }

  create(dto: CreateVenueDto) {
    return this.prisma.venue.create({
      data: { ...dto, active: dto.active ?? true },
    });
  }

  async update(id: string, dto: UpdateVenueDto) {
    await this.ensureExists(id);
    return this.prisma.venue.update({ where: { id }, data: dto });
  }

  // Soft-delete: flip active off so historical VenueOption/Date rows keep their FK.
  async deactivate(id: string) {
    await this.ensureExists(id);
    return this.prisma.venue.update({ where: { id }, data: { active: false } });
  }

  private async ensureExists(id: string): Promise<void> {
    const venue = await this.prisma.venue.findUnique({ where: { id } });
    if (!venue) {
      throw new NotFoundException('Venue not found.');
    }
  }
}
