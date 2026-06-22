import { useState } from 'react';
import { Pencil, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { getIcon } from '@/lib/icons';
import { formatTimeRange } from '@/lib/utils';
import { useArchiveHabit, useDeleteHabit } from '@/hooks/useHabits';
import { useToast } from '@/hooks/useToast';
import type { Habit } from '@/types';

interface HabitListItemProps {
  habit: Habit;
  onEdit: () => void;
}

export function HabitListItem({ habit, onEdit }: HabitListItemProps) {
  const Icon = getIcon(habit.icon);
  const archiveHabit = useArchiveHabit();
  const deleteHabit = useDeleteHabit();
  const { showToast } = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleDelete() {
    try {
      await deleteHabit.mutateAsync(habit.id);
      showToast('Habit deleted.', 'success');
    } catch {
      showToast('Failed to delete habit.', 'error');
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-raised p-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${habit.color}33`, color: habit.color }}
      >
        <Icon size={20} />
      </span>
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium">{habit.name}</p>
        <p className="text-xs text-slate-400">{formatTimeRange(habit.time_start, habit.time_end)}</p>
      </div>
      <button onClick={onEdit} aria-label="Edit habit" className="p-2 text-slate-400">
        <Pencil size={18} />
      </button>
      <button
        onClick={() => archiveHabit.mutate({ id: habit.id, isActive: !habit.is_active })}
        aria-label={habit.is_active ? 'Archive habit' : 'Restore habit'}
        className="p-2 text-slate-400"
      >
        {habit.is_active ? <Archive size={18} /> : <ArchiveRestore size={18} />}
      </button>
      {confirmingDelete ? (
        <div className="flex items-center gap-1">
          <button onClick={handleDelete} className="rounded bg-red-500 px-2 py-1 text-xs text-white">
            Confirm
          </button>
          <button onClick={() => setConfirmingDelete(false)} className="px-2 py-1 text-xs text-slate-400">
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirmingDelete(true)} aria-label="Delete habit" className="p-2 text-red-400">
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}
