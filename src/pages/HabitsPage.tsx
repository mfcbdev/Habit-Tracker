import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { useHabitStreaks } from '@/hooks/useHabitStreaks';
import { useHabitSheets } from '@/hooks/useHabitSheets';
import { LargeTitle } from '@/components/ui/LargeTitle';
import { BubbleCard } from '@/components/ui/BubbleCard';

export default function HabitsPage() {
  const [showArchived, setShowArchived] = useState(false);
  const { data: habits = [], isLoading } = useHabits(showArchived);
  const { data: streaks = [] } = useHabitStreaks();
  const { openCreate, openDetail } = useHabitSheets();

  const visibleHabits = habits.filter((h) => showArchived || h.is_active);

  function streakFor(id: string) {
    return streaks.find((s) => s.habit_id === id)?.current_streak ?? 0;
  }

  return (
    <div className="pt-4">
      <div className="flex items-start justify-between gap-2 px-5">
        <LargeTitle title="Habits" className="px-0" />
        <button
          type="button"
          onClick={openCreate}
          className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-primary px-3.5 py-1.5 text-xs font-semibold text-inverse"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> Habit
        </button>
      </div>

      <div className="mt-1 mb-6 flex justify-end px-5">
        <button
          type="button"
          onClick={() => setShowArchived((v) => !v)}
          className="text-xs font-medium uppercase tracking-wider text-muted hover:text-secondary"
        >
          {showArchived ? 'Hide archived' : 'Show archived'}
        </button>
      </div>

      {isLoading && <p className="px-5 text-sm text-muted">Loading…</p>}

      {!isLoading && visibleHabits.length === 0 && (
        <div className="px-5 text-center">
          <p className="font-serif-display text-xl text-primary">No habits yet</p>
          <p className="mt-1 text-sm text-muted">Tap the + to create your first one.</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-8 px-4 pb-12">
        {visibleHabits.map((habit, idx) => (
          <BubbleCard
            key={habit.id}
            habit={habit}
            count={streakFor(habit.id)}
            size={idx % 3 === 1 ? 200 : 160}
            onClick={() => openDetail(habit)}
          />
        ))}
      </div>
    </div>
  );
}
