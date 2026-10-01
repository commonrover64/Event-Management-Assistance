// One place for cache keys, so invalidating after a change can't miss a typo'd key
export const queryKeys = {
  events: {
    all: ['events'] as const,
    detail: (eventId: string) => ['events', eventId] as const,
  },
};
