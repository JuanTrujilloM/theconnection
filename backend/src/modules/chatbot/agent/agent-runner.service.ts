import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  MessageContent,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { ChatTurn } from '../memory/conversation-cache.service';
import { TOOL_DEFINITIONS, ToolName } from './tool-definitions';

// Cap on agent loops (model → tools → model). Real queries resolve in 1 round;
// this just bounds a misbehaving model.
const MAX_TOOL_STEPS = 4;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export type ToolHandlers = Record<ToolName, () => Promise<string>>;

export interface RunInput {
  systemPrompt: string;
  history: ChatTurn[];
  userText: string;
  handlers: ToolHandlers;
}

// Owns the LLM and the tool-calling loop. OpenRouter is OpenAI-compatible, so we
// drive it through ChatOpenAI with a custom baseURL — the only file that knows
// the provider, keeping the LLM swappable.
@Injectable()
export class AgentRunnerService {
  private readonly model: ChatOpenAI;

  constructor(config: ConfigService) {
    this.model = new ChatOpenAI({
      model: config.get<string>('CHATBOT_MODEL') ?? 'openai/gpt-4o-mini',
      apiKey: config.get<string>('OPENROUTER_API_KEY'),
      timeout: Number(config.get<string>('CHATBOT_REQUEST_TIMEOUT_MS') ?? 9000),
      maxRetries: 1,
      configuration: { baseURL: OPENROUTER_BASE_URL },
    });
  }

  async run({
    systemPrompt,
    history,
    userText,
    handlers,
  }: RunInput): Promise<string> {
    const llm = this.model.bindTools(TOOL_DEFINITIONS);

    const messages: BaseMessage[] = [new SystemMessage(systemPrompt)];
    for (const turn of history) {
      messages.push(
        turn.role === 'human'
          ? new HumanMessage(turn.content)
          : new AIMessage(turn.content),
      );
    }
    messages.push(new HumanMessage(userText));

    for (let step = 0; step < MAX_TOOL_STEPS; step++) {
      const response = await llm.invoke(messages);
      messages.push(response);

      const toolCalls = response.tool_calls ?? [];
      if (toolCalls.length === 0) {
        return contentToText(response.content);
      }

      for (const call of toolCalls) {
        const handler = handlers[call.name as ToolName];
        const result = handler ? await handler() : 'UNKNOWN_TOOL';
        messages.push(
          new ToolMessage({
            content: result,
            tool_call_id: call.id ?? call.name,
          }),
        );
      }
    }

    // Tool budget exhausted: ask once more without tools for a final answer.
    const final = await this.model.invoke(messages);
    return contentToText(final.content);
  }
}

// AIMessage content can be a string or an array of content parts; flatten to text.
function contentToText(content: MessageContent): string {
  if (typeof content === 'string') return content;
  return content
    .map((part) =>
      typeof part === 'string' ? part : 'text' in part ? part.text : '',
    )
    .join('')
    .trim();
}
