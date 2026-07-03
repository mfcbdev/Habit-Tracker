import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { HabitSheetsProvider } from '@/hooks/useHabitSheets';
import { GlobalHabitSheets } from '@/components/habit/GlobalHabitSheets';
import { YesterdaySummarySheet } from '@/components/habit/YesterdaySummarySheet';
import { useBadgeUnlockToast } from '@/hooks/useBadgeUnlockToast';
import { useTimezoneSync } from '@/hooks/useTimezoneSync';

export function AppShell({ children }: { children: ReactNode }) {
  useBadgeUnlockToast();
  useTimezoneSync();

  return (
    <HabitSheetsProvider>
      <div className="flex min-h-screen flex-col bg-bg text-primary">
        <main className="flex-1 overflow-y-auto pb-28 pt-safe-top">{children}</main>
        <BottomNav />
        <GlobalHabitSheets />
        <YesterdaySummarySheet />
      </div>
    </HabitSheetsProvider>
  );
}
