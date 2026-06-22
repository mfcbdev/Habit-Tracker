import { useTodayHabits } from '@/hooks/useTodayHabits';
import { useHabitStreaks } from '@/hooks/useHabitStreaks';
import { HabitCard } from '@/components/habit/HabitCard';

export default function TodayPage() {
  const { data: instances, isLoading, toggleComplete } = useTodayHabits();
  const { data: streaks } = useHabitStreaks();

  const pending = instances?.filter((i) => !i.isCompleted) ?? [];
  const done = instances?.filter((i) => i.isCompleted) ?? [];

  function streakFor(habitId: string) {
    return streaks?.find((s) => s.habit_id === habitId)?.current_streak;
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-semibold">Today</h1>

      {isLoading && <p className="mt-4 text-slate-400">Loading…</p>}

      {!isLoading && instances?.length === 0 && (
        <p className="mt-4 text-slate-400">Nothing scheduled today. Add a habit to get started.</p>
      )}

      {pending.length > 0 && (
        <section className="mt-4 space-y-2">
          <h2 className="text-sm font-medium text-slate-400">Pending ({pending.length})</h2>
          {pending.map((instance) => (
            <HabitCard
              key={instance.habit.id}
              instance={instance}
              streak={streakFor(instance.habit.id)}
              onToggle={() => toggleComplete(instance)}
            />
          ))}
        </section>
      )}

      {done.length > 0 && (
        <section className="mt-6 space-y-2">
          <h2 className="text-sm font-medium text-slate-400">Done ({done.length})</h2>
          {done.map((instance) => (
            <HabitCard
              key={instance.habit.id}
              instance={instance}
              streak={streakFor(instance.habit.id)}
              onToggle={() => toggleComplete(instance)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
