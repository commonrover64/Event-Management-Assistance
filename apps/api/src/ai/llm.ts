import { env } from '../config/env';
import { createGroqProvider } from './providers/groq.provider';
import type { LlmProvider } from './providers/llm-provider';

export const llm: LlmProvider = createGroqProvider({
  apiKey: env.GROQ_API_KEY,
  model: env.GROQ_MODEL,
});
