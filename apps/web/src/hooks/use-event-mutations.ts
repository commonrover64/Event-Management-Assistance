'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { RiskStatus, UpdateTaskInput, UpdateVendorInput } from '@xperience/shared';
import { getErrorMessage } from '@/lib/api/client';
import { risksApi, tasksApi, vendorsApi } from '@/lib/api/event-resources';
import { queryKeys } from '@/lib/query-keys';

// Any edit can raise or resolve risks and adds to the activity log,
// so every mutation refreshes the whole event afterwards
function useEventMutation<TVariables, TData>(
  eventId: string,
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onError: (error) => toast.error(getErrorMessage(error)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) }),
  });
}

export function useUpdateTask(eventId: string) {
  return useEventMutation(
    eventId,
    ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) =>
      tasksApi.update(eventId, taskId, input),
  );
}

export function useUpdateVendor(eventId: string) {
  return useEventMutation(
    eventId,
    ({ vendorId, input }: { vendorId: string; input: UpdateVendorInput }) =>
      vendorsApi.update(eventId, vendorId, input),
  );
}

export function useUpdateRiskStatus(eventId: string) {
  return useEventMutation(eventId, ({ riskId, status }: { riskId: string; status: RiskStatus }) =>
    risksApi.updateStatus(eventId, riskId, status),
  );
}

export function useApplyRiskAction(eventId: string) {
  return useEventMutation(eventId, ({ riskId, index }: { riskId: string; index: number }) =>
    risksApi.applyAction(eventId, riskId, index),
  );
}
