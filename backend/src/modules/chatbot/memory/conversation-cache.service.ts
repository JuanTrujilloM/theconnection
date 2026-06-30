import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatTurn {
  role: 'human' | 'ai';
  content: string;
}

// Default short-lived session; after this the next message is treated as new
// and the bot re-greets. Mirrors CHATBOT_MEMORY_TTL_SECONDS in the env.
const DEFAULT_TTL_SECONDS = 1800;
// Keep only the most recent turns to bound tokens and latency (AC #1).
const MAX_TURNS = 12;

// In-memory short-lived conversation store keyed by userId. Single-instance only;
// swap this provider for a Redis-backed store when the backend runs multi-instance.
@Injectable()
export class ConversationCacheService {
  private readonly store = new Map<
    string,
    { turns: ChatTurn[]; expiresAt: number }
  >();
  private readonly ttlMs: number;

  constructor(config: ConfigService) {
    this.ttlMs =
      Number(
        config.get<string>('CHATBOT_MEMORY_TTL_SECONDS') ?? DEFAULT_TTL_SECONDS,
      ) * 1000;
  }

  // Returns the live history, or null on a cache miss / expiry. Null means
  // "new session", which drives the greeting.
  get(userId: string): ChatTurn[] | null {
    const entry = this.store.get(userId);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(userId);
      return null;
    }
    return entry.turns;
  }

  set(userId: string, turns: ChatTurn[]): void {
    this.store.set(userId, {
      turns: turns.slice(-MAX_TURNS),
      expiresAt: Date.now() + this.ttlMs,
    });
  }
}
