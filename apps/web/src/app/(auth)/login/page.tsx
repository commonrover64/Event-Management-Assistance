import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { safeRedirect } from '@/lib/safe-redirect';

export const metadata: Metadata = { title: 'Sign in' };

// Reading searchParams on the server avoids a Suspense boundary for useSearchParams
export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { next } = await searchParams;
  return <LoginForm redirectTo={safeRedirect(next)} />;
}
