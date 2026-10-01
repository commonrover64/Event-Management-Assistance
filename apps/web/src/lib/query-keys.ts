// Everything about one event lives under ['events', eventId], so invalidating that
// prefix refreshes the whole workspace in one call
export const queryKeys = {
  events: {
    all: ['events'] as const,
    detail: (eventId: string) => ['events', eventId] as const,
  },
  eventData: (eventId: string) => ({
    tasks: ['events', eventId, 'tasks'] as const,
    vendors: ['events', eventId, 'vendors'] as const,
    guestSegments: ['events', eventId, 'guest-segments'] as const,
    risks: ['events', eventId, 'risks'] as const,
    activity: ['events', eventId, 'activity'] as const,
    messages: ['events', eventId, 'messages'] as const,
  }),
};
