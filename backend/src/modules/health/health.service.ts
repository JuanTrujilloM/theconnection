import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface HealthStatus {
  status: 'ok' | 'error';
  service: string;
  timestamp: string;
  database: 'connected' | 'disconnected';
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthStatus> {
    let database: 'connected' | 'disconnected' = 'disconnected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'connected';
    } catch {
      database = 'disconnected';
    }

    return {
      status: database === 'connected' ? 'ok' : 'error',
      service: 'theconnection-api',
      timestamp: new Date().toISOString(),
      database,
    };
  }
}
