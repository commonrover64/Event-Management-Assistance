import { assistantTurnSchema } from '@xperience/shared';
import type { AssistantTurn } from '@xperience/shared';

export type TurnParseResult = { ok: true; turn: AssistantTurn } | { ok: false; error: string };

// Checks only the envelope; each operation is validated separately by the executor
export function parseAssistantTurn(raw: string): TurnParseResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'Response was not valid JSON' };
  }

  const result = assistantTurnSchema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues.map(
      (i) => `${i.path.map(String).join('.') || 'root'}: ${i.message}`,
    );
    return { ok: false, error: issues.join('; ') };
  }
  return { ok: true, turn: result.data };
}
