import type {
  ActivityEntry,
  ChatMessage,
  ChatTurnResponse,
  GuestSegment,
  Risk,
  Task,
  Vendor,
  RejectedOperation,
  RiskStatus,
  UpdateTaskInput,
  UpdateVendorInput,
} from '@xperience/shared';
import { apiRequest } from './client';

const base = (eventId: string) => `/events/${eventId}`;

export const tasksApi = {
  list: async (eventId: string) =>
    (await apiRequest<{ tasks: Task[] }>(`${base(eventId)}/tasks`)).tasks,

  update: async (eventId: string, taskId: string, input: UpdateTaskInput) =>
    (
      await apiRequest<{ task: Task }>(`${base(eventId)}/tasks/${taskId}`, {
        method: 'PATCH',
        body: input,
      })
    ).task,
};

export const vendorsApi = {
  list: async (eventId: string) =>
    (await apiRequest<{ vendors: Vendor[] }>(`${base(eventId)}/vendors`)).vendors,

  update: async (eventId: string, vendorId: string, input: UpdateVendorInput) =>
    (
      await apiRequest<{ vendor: Vendor }>(`${base(eventId)}/vendors/${vendorId}`, {
        method: 'PATCH',
        body: input,
      })
    ).vendor,
};

export const guestSegmentsApi = {
  list: async (eventId: string) =>
    (await apiRequest<{ guestSegments: GuestSegment[] }>(`${base(eventId)}/guest-segments`))
      .guestSegments,
};

export const risksApi = {
  list: async (eventId: string) =>
    (await apiRequest<{ risks: Risk[] }>(`${base(eventId)}/risks`)).risks,

  updateStatus: async (eventId: string, riskId: string, status: RiskStatus) =>
    (
      await apiRequest<{ risk: Risk }>(`${base(eventId)}/risks/${riskId}`, {
        method: 'PATCH',
        body: { status },
      })
    ).risk,

  applyAction: async (eventId: string, riskId: string, actionIndex: number) =>
    (
      await apiRequest<{ rejected: RejectedOperation[] }>(
        `${base(eventId)}/risks/${riskId}/actions/${actionIndex}`,
        { method: 'POST' },
      )
    ).rejected,
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
