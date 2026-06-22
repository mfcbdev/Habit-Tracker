import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { HabitForm } from '@/components/habit/HabitForm';
import { HabitListItem } from '@/components/habit/HabitListItem';
import type { Habit } from '@/types';

export default function HabitsPage() {
  const [showArchived, setShowArchived] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | 'new' | null>(null);
  const { data: habits, isLoading } = useHabits(showArchived);

  const visibleHabits = habits?.filter((h) => showArchived || h.is_active) ?? [];

  return (
    <div className="px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Habits</h1>
        <button
          onClick={() => setEditingHabit('new')}
          className="flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium"
        >
          <Plus size={16} /> New
        </button>
      </div>

      <button onClick={() => setShowArchived((v) => !v)} className="mb-4 text-xs text-slate-400 underline">
        {showArchived ? 'Hide archived' : 'Show archived'}
      </button>

      {isLoading && <p className="text-slate-400">Loading…</p>}

      {!isLoading && visibleHabits.length === 0 && (
        <p className="text-slate-400">No habits yet. Create your first one.</p>
      )}

      <div className="space-y-2">
        {visibleHabits.map((habit) => (
          <HabitListItem key={habit.id} habit={habit} onEdit={() => setEditingHabit(habit)} />
        ))}
      </div>

      {editingHabit && (
        <div className="fixed inset-0 z-20 flex items-end bg-black/60">
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingHabit === 'new' ? 'New habit' : 'Edit habit'}</h2>
              <button onClick={() => setEditingHabit(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <HabitForm
              habit={editingHabit === 'new' ? undefined : editingHabit}
              onDone={() => setEditingHabit(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
