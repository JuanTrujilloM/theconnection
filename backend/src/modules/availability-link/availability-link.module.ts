import { Module } from '@nestjs/common';
import { AvailabilityLinkService } from './availability-link.service';

// Token lifecycle only, with no app dependencies, so both the matching flow
// (issues links) and the public availability flow (validates them) can import
// it without a circular module reference.
@Module({
  providers: [AvailabilityLinkService],
  exports: [AvailabilityLinkService],
})
export class AvailabilityLinkModule {}
