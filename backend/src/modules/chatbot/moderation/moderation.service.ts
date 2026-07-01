import { Injectable } from '@nestjs/common';

// Baseline pre-filter for clearly abusive content (AC #7). It only catches the
// obvious cases cheaply before any LLM call; nuanced off-topic redirection is
// handled by the system prompt. Swap for a model-based moderation pass (e.g. an
// OpenRouter moderation model) without changing callers.
const ABUSIVE_PATTERNS: RegExp[] = [
  /\bputa\b/i,
  /\bmaric[oó]n\b/i,
  /\bgonorrea\b/i,
  /\bhijueputa\b/i,
  /\bfuck\b/i,
  /\bbitch\b/i,
];

@Injectable()
export class ModerationService {
  screen(text: string): { blocked: boolean } {
    return { blocked: ABUSIVE_PATTERNS.some((pattern) => pattern.test(text)) };
  }
}
