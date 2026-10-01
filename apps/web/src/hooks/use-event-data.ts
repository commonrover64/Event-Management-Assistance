'use client';

import { useQuery } from '@tanstack/react-query';
import {
  activityApi,
  guestSegmentsApi,
  risksApi,
  tasksApi,
  vendorsApi,
} from '@/lib/api/event-resources';
import { queryKeys } from '@/lib/query-keys';

export function useTasks(eventId: string) {
  return useQuery({
    queryKey: queryKeys.eventData(eventId).tasks,
    queryFn: () => tasksApi.list(eventId),
  });
}

export function useVendors(eventId: string) {
  return useQuery({
    queryKey: queryKeys.eventData(eventId).vendors,
    queryFn: () => vendorsApi.list(eventId),
  });
}

export function useGuestSegments(eventId: string) {
  return useQuery({
    queryKey: queryKeys.eventData(eventId).guestSegments,
    queryFn: () => guestSegmentsApi.list(eventId),
  });
}

export function useRisks(eventId: string) {
  return useQuery({
    queryKey: queryKeys.eventData(eventId).risks,
    queryFn: () => risksApi.list(eventId),
  });
}

export function useActivity(eventId: string) {
  return useQuery({
    queryKey: queryKeys.eventData(eventId).activity,
    queryFn: () => activityApi.list(eventId),
  });
}
