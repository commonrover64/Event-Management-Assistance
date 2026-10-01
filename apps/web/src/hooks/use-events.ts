'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api/events';
import { queryKeys } from '@/lib/query-keys';

export function useEvents() {
  return useQuery({ queryKey: queryKeys.events.all, queryFn: eventsApi.list });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => eventsApi.get(eventId),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: (event) => {
      // Seed the detail cache so the next page renders instantly
      queryClient.setQueryData(queryKeys.events.detail(event.id), event);
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}
