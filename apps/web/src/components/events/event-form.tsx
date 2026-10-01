'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { EVENT_TYPES, createEventInputSchema } from '@xperience/shared';
import { FormField, fieldA11y } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateEvent } from '@/hooks/use-events';
import { getErrorMessage } from '@/lib/api/client';
import { browserTimezone } from '@/lib/format';

// Native select styled to match the Input component
const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive';

// Empty optional inputs are sent as "not provided" rather than ""
const emptyToUndefined = (value: string) => (value.trim() === '' ? undefined : value);
const toNumberOrUndefined = (value: string) => (value === '' ? undefined : Number(value));
const toNumberOrNull = (value: string) => (value === '' ? null : Number(value));

export function EventForm() {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createEventInputSchema),
    // Safe to read the browser timezone here: this page only renders after the client
    // has restored the session, never during server rendering
    defaultValues: { title: '', type: 'wedding', timezone: browserTimezone() },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const event = await createEvent.mutateAsync(values);
      toast.success('Event created');
      router.push(`/events/${event.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormField id="title" label="Event name" error={errors.title?.message}>
        <Input
          placeholder="Sharma–Verma Wedding"
          {...fieldA11y('title', errors.title?.message)}
          {...register('title')}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="type" label="Type" error={errors.type?.message}>
          <select
            className={selectClass}
            {...fieldA11y('type', errors.type?.message)}
            {...register('type')}
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="headcount" label="Expected guests" error={errors.headcount?.message}>
          <Input
            type="number"
            min={1}
            inputMode="numeric"
            {...fieldA11y('headcount', errors.headcount?.message)}
            {...register('headcount', { setValueAs: toNumberOrUndefined })}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="startDate" label="Starts" error={errors.startDate?.message}>
          <Input
            type="date"
            {...fieldA11y('startDate', errors.startDate?.message)}
            {...register('startDate')}
          />
        </FormField>
        <FormField id="endDate" label="Ends" error={errors.endDate?.message}>
          <Input
            type="date"
            {...fieldA11y('endDate', errors.endDate?.message)}
            {...register('endDate')}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="location" label="Location" error={errors.location?.message}>
          <Input
            placeholder="Jaipur"
            {...fieldA11y('location', errors.location?.message)}
            {...register('location', { setValueAs: emptyToUndefined })}
          />
        </FormField>
        <FormField id="budget" label="Budget (optional)" error={errors.budget?.message}>
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            {...fieldA11y('budget', errors.budget?.message)}
            {...register('budget', { setValueAs: toNumberOrNull })}
          />
        </FormField>
      </div>

      <FormField
        id="timezone"
        label="Timezone"
        hint="Deadlines and reminders use this timezone."
        error={errors.timezone?.message}
      >
        <Input {...fieldA11y('timezone', errors.timezone?.message)} {...register('timezone')} />
      </FormField>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create event'}
        </Button>
      </div>
    </form>
  );
}