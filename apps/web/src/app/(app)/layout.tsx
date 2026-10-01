'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { FullPageLoader } from '@/components/layout/full-page-loader';
import { useAuth } from '@/lib/auth/auth-context';

// UX guard only: the API rejects unauthenticated requests regardless
export default function AppLayout({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'anonymous') router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, router, pathname]);

  if (status !== 'authenticated') return <FullPageLoader />;

  return (
    <>
      <AppHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
