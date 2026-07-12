import { Module } from '@nestjs/common';
import { MatchesModule } from '../matches/matches.module';
import { ChatbotService } from './chatbot.service';
import { AgentRunnerService } from './agent/agent-runner.service';
import { GetAppHelpTool } from './agent/tools/get-app-help.tool';
import { GetMatchDetailsTool } from './agent/tools/get-match-details.tool';
import { GetUpcomingDateTool } from './agent/tools/get-upcoming-date.tool';
import { RejectMatchTool } from './agent/tools/reject-match.tool';
import { ConversationCacheService } from './memory/conversation-cache.service';
import { ModerationService } from './moderation/moderation.service';
import { UserResolverService } from './user-context/user-resolver.service';

// AI brain only. The future WhatsApp transport module imports this and calls
// ChatbotService.handleIncomingMessage. PrismaModule is global, so it's available.
// MatchesModule provides MatchResponseService for the reject_match tool.
@Module({
  imports: [MatchesModule],
  providers: [
    ChatbotService,
    AgentRunnerService,
    ConversationCacheService,
    ModerationService,
    UserResolverService,
    GetMatchDetailsTool,
    GetUpcomingDateTool,
    GetAppHelpTool,
    RejectMatchTool,
  ],
  exports: [ChatbotService],
})
export class ChatbotModule {}
