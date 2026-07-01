import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AgentRunnerService, ToolHandlers } from './agent/agent-runner.service';
import { buildSystemPrompt } from './agent/system-prompt';
import { GetAppHelpTool } from './agent/tools/get-app-help.tool';
import { GetMatchDetailsTool } from './agent/tools/get-match-details.tool';
import { GetUpcomingDateTool } from './agent/tools/get-upcoming-date.tool';
import { ConversationCacheService } from './memory/conversation-cache.service';
import { ModerationService } from './moderation/moderation.service';
import { UserResolverService } from './user-context/user-resolver.service';
import { IncomingMessageDto } from './dto/incoming-message.dto';

// Polite redirect for off-scope/offensive input (AC #7).
const REDIRECT_MESSAGE =
  'Estoy aquí para ayudarte con tus citas en TheConnection 😊. Puedo darte consejos ' +
  'para tu cita, contarte sobre tu match actual o tu próxima cita, o ayudarte con la app. ' +
  '¿Con qué te ayudo?';

// Graceful fallback when the model errors or times out (AC #1).
const FALLBACK_MESSAGE =
  'Uy, tuve un problema para responder en este momento. ¿Puedes intentarlo de nuevo en un ratito?';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly resolver: UserResolverService,
    private readonly moderation: ModerationService,
    private readonly cache: ConversationCacheService,
    private readonly runner: AgentRunnerService,
    private readonly matchTool: GetMatchDetailsTool,
    private readonly dateTool: GetUpcomingDateTool,
    private readonly helpTool: GetAppHelpTool,
  ) {}

  // Single entry point the WhatsApp transport calls. Returns the reply text to send.
  async handleIncomingMessage(
    dto: IncomingMessageDto,
  ): Promise<{ reply: string }> {
    const resolved = await this.resolver.resolve(dto.cellphone);
    if (resolved.status !== 'ok') {
      return { reply: this.registrationMessage() };
    }

    if (this.moderation.screen(dto.text).blocked) {
      return { reply: REDIRECT_MESSAGE };
    }

    const { userId, context } = resolved;
    const history = this.cache.get(userId);
    const isNewSession = history === null;

    try {
      const reply = await this.runner.run({
        systemPrompt: buildSystemPrompt(context, isNewSession),
        history: history ?? [],
        userText: dto.text,
        handlers: this.buildHandlers(userId),
      });

      this.cache.set(userId, [
        ...(history ?? []),
        { role: 'human', content: dto.text },
        { role: 'ai', content: reply },
      ]);

      return { reply };
    } catch (error) {
      this.logger.error(
        `Chatbot run failed for user ${userId}`,
        error as Error,
      );
      return { reply: FALLBACK_MESSAGE };
    }
  }

  // Tools are bound to THIS user's id; the model can only ever read this user's
  // data. That closure is the privacy boundary for AC #6.
  private buildHandlers(userId: string): ToolHandlers {
    return {
      get_match_details: () => this.matchTool.run(userId),
      get_upcoming_date: () => this.dateTool.run(userId),
      get_app_help: () => Promise.resolve(this.helpTool.run()),
    };
  }

  private registrationMessage(): string {
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    return (
      '¡Hola! Para usar el asistente de TheConnection primero necesitas completar tu ' +
      `registro y verificar tu cuenta. Regístrate aquí: ${frontendUrl}/register`
    );
  }
}
