'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { APP_NAME } from '@xperience/shared';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/events" className="font-semibold tracking-tight">
          {APP_NAME}
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={() => void logout()}>
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
