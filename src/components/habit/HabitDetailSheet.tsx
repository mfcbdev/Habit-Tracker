import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, MoreHorizontal, Pencil, Archive, Trash2, X, Quote } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { HeatmapCalendar } from '@/components/ui/HeatmapCalendar';
import { HabitForm } from '@/components/habit/HabitForm';
import { useArchiveHabit, useDeleteHabit } from '@/hooks/useHabits';
import { useHabitCompletions } from '@/hooks/useHabitCompletions';
import { useToast } from '@/hooks/useToast';
import { playTapSound } from '@/lib/sound';
import type { Habit } from '@/types';

interface HabitDetailSheetProps {
  habit: Habit | null;
  open: boolean;
  onClose: () => void;
}

export function HabitDetailSheet({ habit, open, onClose }: HabitDetailSheetProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const { data: completions = [] } = useHabitCompletions(habit?.id);
  const archive = useArchiveHabit();
  const del = useDeleteHabit();
  const { showToast } = useToast();

  function handleEdit() {
    setMode('edit');
  }

  async function handleArchive() {
    if (!habit) return;
    await archive.mutateAsync({ id: habit.id, isActive: !habit.is_active });
    showToast(habit.is_active ? 'Habit archived' : 'Habit restored', 'success');
    handleClose();
  }

  async function handleDelete() {
    if (!habit) return;
    if (!window.confirm(`Delete "${habit.name}"? This cannot be undone.`)) return;
    await del.mutateAsync(habit.id);
    showToast('Habit deleted', 'success');
    handleClose();
  }

  function handleClose() {
    playTapSound();
    setMode('view');
    onClose();
  }

  if (!habit) return null;

  const startTime = habit.time_start.slice(0, 5);
  const completedDates = completions.map((c) => c.completed_date);
  const createdLabel = format(parseISO(habit.created_at), 'MMM d, yyyy');

  return (
    <BottomSheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <div className="-mt-2 flex items-center justify-end gap-2">
        {mode === 'view' && (
          <ActionMenu
            trigger={
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-secondary">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            }
            items={[
              { label: 'Edit', icon: Pencil, onSelect: handleEdit },
              {
                label: habit.is_active ? 'Archive' : 'Restore',
                icon: Archive,
                onSelect: handleArchive,
              },
              { label: 'Delete', icon: Trash2, onSelect: handleDelete, destructive: true },
            ]}
          />
        )}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-secondary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {mode === 'edit' ? (
        <div className="mt-4">
          <HabitForm habit={habit} onDone={handleClose} />
        </div>
      ) : (
        <div className="mt-2 space-y-7">
          <h2 className="font-serif-display text-[26px] leading-[1.25] text-primary text-balance">
            I will <Underlined>{habit.name}</Underlined>, every day at <Underlined>{startTime}</Underlined>
            {habit.purpose ? (
              <>
                , so that I can become <Underlined>{habit.purpose}</Underlined>.
              </>
            ) : (
              <>
                .{' '}
                <button
                  type="button"
                  onClick={handleEdit}
                  className="text-[15px] font-sans italic text-muted underline decoration-dotted underline-offset-4"
                >
                  Add a purpose
                </button>
              </>
            )}
          </h2>

          <div className="flex items-center gap-2 text-sm text-secondary">
            <Clock className="h-4 w-4" />
            <span>Daily at {startTime}</span>
          </div>

          {habit.description?.trim() && (
            <div className="rounded-card border border-DEFAULT bg-surface-raised p-4">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                <Quote className="h-3 w-3" /> Why this matters
              </p>
              <p className="text-[14px] leading-relaxed text-secondary">{habit.description}</p>
            </div>
          )}

          <div className="rounded-card bg-surface-raised p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Total repetitions</p>
            <p className="mt-1 text-xs text-muted">Since {createdLabel}</p>
            <p className="mt-3 font-serif-display text-5xl font-medium text-primary">
              {completions.length}
            </p>
            <div className="mt-5">
              <HeatmapCalendar completedDates={completedDates} color={habit.color} monthsBack={3} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-card bg-surface-raised px-5 py-4">
            <div>
              <p className="text-sm font-medium text-primary">Current schedule</p>
              <p className="text-xs text-muted">Since {createdLabel}</p>
            </div>
            <span className="text-sm text-secondary">{startTime}</span>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

function Underlined({ children }: { children: React.ReactNode }) {
  return <span className="underline decoration-2 decoration-accent/70 underline-offset-[6px]">{children}</span>;
}
