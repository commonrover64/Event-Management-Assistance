'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { FullPageLoader } from '@/components/layout/full-page-loader';
import { useAuth } from '@/lib/auth/auth-context';

// Signed-in users have no reason to see login or register
export default function AuthLayout({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/events');
  }, [status, router]);

  if (status !== 'anonymous') return <FullPageLoader />;

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-12">
      {children}
    </main>
  );
}
