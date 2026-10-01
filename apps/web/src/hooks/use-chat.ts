'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ChatMessage } from '@xperience/shared';
import { messagesApi } from '@/lib/api/event-resources';
import { queryKeys } from '@/lib/query-keys';

export function useMessages(eventId: string) {
  return useQuery({
    queryKey: queryKeys.eventData(eventId).messages,
    queryFn: () => messagesApi.list(eventId),
  });
}

export function useSendMessage(eventId: string) {
  const queryClient = useQueryClient();
  const messagesKey = queryKeys.eventData(eventId).messages;

  return useMutation({
    mutationFn: (content: string) => messagesApi.send(eventId, content),

    // Show the manager's message immediately instead of after the AI replies
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: messagesKey });
      const optimistic: ChatMessage = {
        id: `pending-${Date.now()}`,
        eventId,
        role: 'user',
        content,
        changes: [],
        rejected: [],
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<ChatMessage[]>(messagesKey, (old = []) => [...old, optimistic]);
      return { optimisticId: optimistic.id };
    },

    onSuccess: ({ userMessage, assistantMessage }, _content, context) => {
      queryClient.setQueryData<ChatMessage[]>(messagesKey, (old = []) => [
        ...old.filter((m) => m.id !== context.optimisticId),
        userMessage,
        assistantMessage,
      ]);
    },

    onError: (_error, _content, context) => {
      queryClient.setQueryData<ChatMessage[]>(messagesKey, (old = []) =>
        old.filter((m) => m.id !== context?.optimisticId),
      );
    },

    // The assistant may have changed anything, so refresh every dashboard query for this event
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.detail(eventId),
        predicate: (query) => query.queryKey[2] !== 'messages',
      }),
  });
}
