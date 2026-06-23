import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { HabitSheetsProvider } from '@/hooks/useHabitSheets';
import { GlobalHabitSheets } from '@/components/habit/GlobalHabitSheets';
import { useBadgeUnlockToast } from '@/hooks/useBadgeUnlockToast';

export function AppShell({ children }: { children: ReactNode }) {
  useBadgeUnlockToast();

  return (
    <HabitSheetsProvider>
      <div className="flex min-h-screen flex-col bg-bg text-primary">
        <main className="flex-1 overflow-y-auto pb-28 pt-safe-top">{children}</main>
        <BottomNav />
        <GlobalHabitSheets />
      </div>
    </HabitSheetsProvider>
  );
}
