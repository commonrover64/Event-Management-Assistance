import Groq from 'groq-sdk';
import { AppError } from '../../lib/errors';
import type { LlmProvider, LlmRequest } from './llm-provider';

interface GroqProviderOptions {
  apiKey: string;
  model: string;
}

function toAppError(err: unknown): AppError {
  if (err instanceof Groq.RateLimitError) {
    return new AppError(503, 'AI_RATE_LIMITED', 'The AI service is busy, please retry shortly');
  }
  if (err instanceof Groq.APIConnectionTimeoutError) {
    return new AppError(504, 'AI_TIMEOUT', 'The AI service took too long to respond');
  }
  if (err instanceof Groq.APIError) {
    return new AppError(502, 'AI_UNAVAILABLE', 'The AI service returned an error', {
      status: err.status,
    });
  }
  return new AppError(502, 'AI_UNAVAILABLE', 'Could not reach the AI service');
}

export function createGroqProvider({ apiKey, model }: GroqProviderOptions): LlmProvider {
  const client = new Groq({ apiKey, timeout: 45_000, maxRetries: 2 });

  return {
    name: `groq:${model}`,

    async completeJson({ messages, temperature = 0.2 }: LlmRequest): Promise<string> {
      try {
        const completion = await client.chat.completions.create({
          model,
          messages,
          temperature,
          // JSON mode guarantees parseable JSON; our Zod schemas enforce the shape
          response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message.content;
        if (!content) throw new AppError(502, 'AI_EMPTY_RESPONSE', 'The AI returned no content');
        return content;
      } catch (err) {
        throw err instanceof AppError ? err : toAppError(err);
      }
    },
  };
}
