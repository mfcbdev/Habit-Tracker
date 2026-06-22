import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { useBadgeUnlockToast } from '@/hooks/useBadgeUnlockToast';

export function AppShell({ children }: { children: ReactNode }) {
  // Mounted for the lifetime of any authenticated screen, so a badge earned
  // while on Today/Habits/Schedule still surfaces a toast immediately.
  useBadgeUnlockToast();

  return (
    <div className="flex min-h-screen flex-col bg-surface text-slate-100">
      <main className="flex-1 overflow-y-auto pb-24 pt-safe-top">{children}</main>
      <BottomNav />
    </div>
  );
}
