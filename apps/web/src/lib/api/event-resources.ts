import type {
  ActivityEntry,
  ChatMessage,
  ChatTurnResponse,
  GuestSegment,
  Risk,
  Task,
  Vendor,
} from '@xperience/shared';
import { apiRequest } from './client';

const base = (eventId: string) => `/events/${eventId}`;

export const tasksApi = {
  list: async (eventId: string) =>
    (await apiRequest<{ tasks: Task[] }>(`${base(eventId)}/tasks`)).tasks,
};

export const vendorsApi = {
  list: async (eventId: string) =>
    (await apiRequest<{ vendors: Vendor[] }>(`${base(eventId)}/vendors`)).vendors,
};

export const guestSegmentsApi = {
  list: async (eventId: string) =>
    (await apiRequest<{ guestSegments: GuestSegment[] }>(`${base(eventId)}/guest-segments`))
      .guestSegments,
};

export const risksApi = {
  list: async (eventId: string) =>
    (await apiRequest<{ risks: Risk[] }>(`${base(eventId)}/risks`)).risks,
};

export const activityApi = {
  list: async (eventId: string, limit = 50) =>
    (await apiRequest<{ activity: ActivityEntry[] }>(`${base(eventId)}/activity?limit=${limit}`))
      .activity,
};

export const messagesApi = {
  list: async (eventId: string) =>
    (await apiRequest<{ messages: ChatMessage[] }>(`${base(eventId)}/messages`)).messages,

  send: (eventId: string, content: string) =>
    apiRequest<ChatTurnResponse>(`${base(eventId)}/messages`, {
      method: 'POST',
      body: { content },
    }),
};
