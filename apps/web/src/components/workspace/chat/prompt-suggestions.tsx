import type { EventType } from '@xperience/shared';

const SUGGESTIONS: Record<'wedding' | 'corporate' | 'default', string[]> = {
  wedding: [
    'We need venue, catering, décor, photography, entertainment, accommodation, transport and invitations.',
    'Around 150 guests will travel from outside the city. Arrange accommodation and airport transfers.',
    'What is still pending, and what are the biggest risks?',
  ],
  corporate: [
    'We need transport, accommodation, food, team-building activities, entertainment and branding.',
    'The CEO joins only on day two, so the leadership session must be scheduled then.',
    'What is still pending, and what are the biggest risks?',
  ],
  default: [
    'Here is what we need for this event: venue, catering and invitations.',
    'What is still pending, and what are the biggest risks?',
  ],
};

interface PromptSuggestionsProps {
  eventType: EventType;
  onPick: (prompt: string) => void;
}

// Shown on an empty chat so a first-time manager knows what to say
export function PromptSuggestions({ eventType, onPick }: PromptSuggestionsProps) {
  const prompts =
    eventType === 'wedding' || eventType === 'corporate'
      ? SUGGESTIONS[eventType]
      : SUGGESTIONS.default;

  return (
    <div className="space-y-3 py-6 text-center">
      <p className="text-sm font-medium">Describe your event in plain words</p>
      <p className="text-xs text-muted-foreground">
        The assistant turns it into sub-events, tasks and vendors, and flags risks as you go.
      </p>
      <div className="flex flex-col gap-2 pt-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="rounded-lg border bg-background px-3 py-2 text-left text-xs transition-colors hover:bg-muted"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
