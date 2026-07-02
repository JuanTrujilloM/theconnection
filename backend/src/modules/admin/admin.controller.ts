import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminService } from './admin.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

// Admin panel API. Every route requires a valid session AND an ADMIN_EMAILS
// allowlist match (AdminGuard runs after JwtAuthGuard). Venues live in their own
// controller at /admin/venues.
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Patch('users/:id/status')
  setUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.adminService.setUserStatus(id, dto.status);
  }

  @Patch('users/:id/verify')
  verifyUser(@Param('id') id: string) {
    return this.adminService.verifyUser(id);
  }

  @Get('matches')
  listMatches() {
    return this.adminService.listMatches();
  }

  @Get('matches/:id')
  getMatch(@Param('id') id: string) {
    return this.adminService.getMatchDetail(id);
  }

  @Patch('matches/:id/cancel')
  cancelMatch(@Param('id') id: string) {
    return this.adminService.cancelMatch(id);
  }

  @Get('feedback')
  listFeedback() {
    return this.adminService.listFeedback();
  }

  @Get('reports')
  listReports() {
    return this.adminService.listReports();
  }
}
