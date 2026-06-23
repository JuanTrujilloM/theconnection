import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [StorageModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
