import { ConfigService } from '@nestjs/config';
import { ChatbotService } from './chatbot.service';
import { AgentRunnerService } from './agent/agent-runner.service';
import { GetAppHelpTool } from './agent/tools/get-app-help.tool';
import { GetMatchDetailsTool } from './agent/tools/get-match-details.tool';
import { GetUpcomingDateTool } from './agent/tools/get-upcoming-date.tool';
import { RejectMatchTool } from './agent/tools/reject-match.tool';
import { ConversationCacheService } from './memory/conversation-cache.service';
import { ModerationService } from './moderation/moderation.service';
import {
  ChatUserContext,
  UserResolverService,
} from './user-context/user-resolver.service';

const context: ChatUserContext = {
  userId: 'u1',
  name: 'Ana',
  age: 24,
  university: 'EAFIT',
  major: 'Derecho',
  semester: '5',
  interests: [],
  relationshipType: null,
  orientation: null,
  energyVibe: null,
};

describe('ChatbotService', () => {
  const resolve = jest.fn();
  const screen = jest.fn();
  const cacheGet = jest.fn();
  const cacheSet = jest.fn();
  const run = jest.fn();

  const config = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  } as unknown as ConfigService;
  const resolver = { resolve } as unknown as UserResolverService;
  const moderation = { screen } as unknown as ModerationService;
  const cache = {
    get: cacheGet,
    set: cacheSet,
  } as unknown as ConversationCacheService;
  const runner = { run } as unknown as AgentRunnerService;
  const noTool = {} as unknown as GetMatchDetailsTool;

  const service = new ChatbotService(
    config,
    resolver,
    moderation,
    cache,
    runner,
    noTool,
    noTool as unknown as GetUpcomingDateTool,
    noTool as unknown as GetAppHelpTool,
    noTool as unknown as RejectMatchTool,
  );

  beforeEach(() => {
    resolve.mockReset();
    screen.mockReset().mockReturnValue({ blocked: false });
    cacheGet.mockReset().mockReturnValue(null);
    cacheSet.mockReset();
    run.mockReset();
  });

  it('sends a registration link and skips the LLM for an unregistered number', async () => {
    resolve.mockResolvedValue({ status: 'unregistered' });

    const { reply } = await service.handleIncomingMessage({
      cellphone: '+57300',
      text: 'hola',
    });

    expect(reply).toContain('/register');
    expect(run).not.toHaveBeenCalled();
  });

  it('redirects offensive input without calling the LLM', async () => {
    resolve.mockResolvedValue({ status: 'ok', userId: 'u1', context });
    screen.mockReturnValue({ blocked: true });

    const { reply } = await service.handleIncomingMessage({
      cellphone: '+57300',
      text: 'eres una puta',
    });

    expect(reply).toContain('TheConnection');
    expect(run).not.toHaveBeenCalled();
  });

  it('runs the agent and caches the turn on the happy path', async () => {
    resolve.mockResolvedValue({ status: 'ok', userId: 'u1', context });
    run.mockResolvedValue('Hola Ana 👋');

    const { reply } = await service.handleIncomingMessage({
      cellphone: '+57300',
      text: 'hola',
    });

    expect(reply).toBe('Hola Ana 👋');
    expect(run).toHaveBeenCalledTimes(1);
    expect(cacheSet).toHaveBeenCalledWith('u1', [
      { role: 'human', content: 'hola' },
      { role: 'ai', content: 'Hola Ana 👋' },
    ]);
  });

  it('falls back gracefully when the agent throws', async () => {
    resolve.mockResolvedValue({ status: 'ok', userId: 'u1', context });
    run.mockRejectedValue(new Error('timeout'));

    const { reply } = await service.handleIncomingMessage({
      cellphone: '+57300',
      text: 'hola',
    });

    expect(reply).toContain('problema');
    expect(cacheSet).not.toHaveBeenCalled();
  });
});
