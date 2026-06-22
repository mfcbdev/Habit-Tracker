import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-slate-100">
      <main className="flex-1 overflow-y-auto pb-24 pt-safe-top">{children}</main>
      <BottomNav />
    </div>
  );
}
