import { Injectable } from '@nestjs/common';
import { MatchResponseService } from '../../../matches/match-response.service';

// HU-07: lets the user reject their weekly match from the chat. Bound to the
// resolved userId in ChatbotService, so a user can only reject their own match.
@Injectable()
export class RejectMatchTool {
  constructor(private readonly matchResponse: MatchResponseService) {}

  async run(userId: string): Promise<string> {
    const result = await this.matchResponse.reject(userId);
    // Short tokens the model turns into a natural confirmation (like the read tools).
    return result === 'rejected' ? 'REJECTED' : 'NO_ACTIVE_MATCH';
  }
}
