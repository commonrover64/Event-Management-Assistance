'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { registerInputSchema } from '@xperience/shared';
import { FormField, fieldA11y } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthCard } from './auth-card';

export function RegisterForm() {
  const { register: registerAccount } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerInputSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerAccount(values);
      router.replace('/events');
    } catch (err) {
      setError('root', { message: getErrorMessage(err) });
    }
  });

  return (
    <AuthCard
      title="Create your account"
      description="Plan events by simply talking them through."
      footer={
        <span>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField id="name" label="Name" error={errors.name?.message}>
          <Input
            autoComplete="name"
            {...fieldA11y('name', errors.name?.message)}
            {...register('name')}
          />
        </FormField>
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            {...fieldA11y('email', errors.email?.message)}
            {...register('email')}
          />
        </FormField>
        <FormField
          id="password"
          label="Password"
          hint="At least 8 characters."
          error={errors.password?.message}
        >
          <Input
            type="password"
            autoComplete="new-password"
            {...fieldA11y('password', errors.password?.message)}
            {...register('password')}
          />
        </FormField>
        {errors.root && (
          <p role="alert" className="text-sm text-destructive">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  );
}
