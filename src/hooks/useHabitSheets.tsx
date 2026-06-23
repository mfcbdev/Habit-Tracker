import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Habit } from '@/types';

type SheetMode = { kind: 'closed' } | { kind: 'create' } | { kind: 'edit'; habit: Habit } | { kind: 'detail'; habit: Habit };

interface HabitSheetsContextValue {
  mode: SheetMode;
  openCreate: () => void;
  openEdit: (habit: Habit) => void;
  openDetail: (habit: Habit) => void;
  close: () => void;
}

const HabitSheetsContext = createContext<HabitSheetsContextValue | undefined>(undefined);

export function HabitSheetsProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SheetMode>({ kind: 'closed' });

  const openCreate = useCallback(() => setMode({ kind: 'create' }), []);
  const openEdit = useCallback((habit: Habit) => setMode({ kind: 'edit', habit }), []);
  const openDetail = useCallback((habit: Habit) => setMode({ kind: 'detail', habit }), []);
  const close = useCallback(() => setMode({ kind: 'closed' }), []);

  const value = useMemo(
    () => ({ mode, openCreate, openEdit, openDetail, close }),
    [mode, openCreate, openEdit, openDetail, close],
  );

  return <HabitSheetsContext.Provider value={value}>{children}</HabitSheetsContext.Provider>;
}

export function useHabitSheets(): HabitSheetsContextValue {
  const ctx = useContext(HabitSheetsContext);
  if (!ctx) throw new Error('useHabitSheets must be used inside HabitSheetsProvider');
  return ctx;
}
