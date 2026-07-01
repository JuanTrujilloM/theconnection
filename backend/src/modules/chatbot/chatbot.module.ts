import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { AgentRunnerService } from './agent/agent-runner.service';
import { GetAppHelpTool } from './agent/tools/get-app-help.tool';
import { GetMatchDetailsTool } from './agent/tools/get-match-details.tool';
import { GetUpcomingDateTool } from './agent/tools/get-upcoming-date.tool';
import { ConversationCacheService } from './memory/conversation-cache.service';
import { ModerationService } from './moderation/moderation.service';
import { UserResolverService } from './user-context/user-resolver.service';

// AI brain only. The future WhatsApp transport module imports this and calls
// ChatbotService.handleIncomingMessage. PrismaModule is global, so it's available.
@Module({
  providers: [
    ChatbotService,
    AgentRunnerService,
    ConversationCacheService,
    ModerationService,
    UserResolverService,
    GetMatchDetailsTool,
    GetUpcomingDateTool,
    GetAppHelpTool,
  ],
  exports: [ChatbotService],
})
export class ChatbotModule {}
