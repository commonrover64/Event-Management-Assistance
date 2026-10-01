// Dry run: shows the snapshot and the model's proposed operations without changing anything.
// Usage: npm run ai:preview -w @xperience/api -- <eventId> "message to the assistant"
import { operationSchema } from '@xperience/shared';
import { llm } from '../ai/llm';
import { buildSystemPrompt } from '../ai/prompts/chat-system-prompt';
import { buildEventSnapshot } from '../ai/snapshot';
import { parseAssistantTurn } from '../ai/turn';
import { env } from '../config/env';
import { connectDatabase, disconnectDatabase } from '../lib/db';

const [eventId, ...words] = process.argv.slice(2);
if (!eventId || words.length === 0) {
  console.error('Usage: npm run ai:preview -w @xperience/api -- <eventId> "message"');
  process.exit(1);
}

await connectDatabase(env.MONGODB_URI);

try {
  const { payload } = await buildEventSnapshot(eventId);
  const system = buildSystemPrompt(payload);
  console.log('\n--- snapshot sent to the model ---');
  console.log(JSON.stringify(payload, null, 2));
  console.log(`(system prompt: ${system.length} characters)`);

  const started = Date.now();
  const raw = await llm.completeJson({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: words.join(' ') },
    ],
  });
  console.log(`\n--- ${llm.name} responded in ${Date.now() - started} ms ---`);

  const parsed = parseAssistantTurn(raw);
  if (!parsed.ok) {
    console.log('Invalid turn:', parsed.error, '\nRaw:', raw);
  } else {
    console.log('Reply:', parsed.turn.reply, '\n');
    for (const op of parsed.turn.operations) {
      const check = operationSchema.safeParse(op);
      console.log(check.success ? 'VALID  ' : 'INVALID', JSON.stringify(op));
      if (!check.success)
        console.log('        ', check.error.issues.map((i) => i.message).join('; '));
    }
  }
} finally {
  await disconnectDatabase();
}
