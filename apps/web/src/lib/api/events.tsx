import type { CreateEventInput, EventDetails } from '@xperience/shared';
import { apiRequest } from './client';

export const eventsApi = {
  list: async () => (await apiRequest<{ events: EventDetails[] }>('/events')).events,

  get: async (eventId: string) =>
    (await apiRequest<{ event: EventDetails }>(`/events/${eventId}`)).event,

  create: async (input: CreateEventInput) =>
    (await apiRequest<{ event: EventDetails }>('/events', { method: 'POST', body: input })).event,
};
