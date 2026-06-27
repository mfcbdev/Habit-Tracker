import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useHabitsForDate } from '@/hooks/useHabitsForDate';
import { useHabitStreaks } from '@/hooks/useHabitStreaks';
import { useProfile } from '@/hooks/useProfile';
import { useWeekStatus } from '@/hooks/useWeekStatus';
import { getTodayInTimezone, toMinutes } from '@/lib/utils';
import { LargeTitle } from '@/components/ui/LargeTitle';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { WeekStrip } from '@/components/habit/WeekStrip';
import { HabitCapsuleCard } from '@/components/habit/HabitCapsuleCard';
import type { HabitInstance } from '@/types';

type Filter = 'todos' | 'completed';

interface Bucket {
  key: string;
  label: string;
  instances: HabitInstance[];
}

function bucketOf(startTime: string): { key: string; label: string; order: number } {
  const m = toMinutes(startTime);
  if (m < 12 * 60) return { key: 'morning', label: 'Morning', order: 0 };
  if (m < 18 * 60) return { key: 'afternoon', label: 'Afternoon', order: 1 };
  return { key: 'evening', label: 'Evening', order: 2 };
}

export default function TodayPage() {
  const [filter, setFilter] = useState<Filter>('todos');
  const { data: profile } = useProfile();
  const timezone = profile?.timezone ?? 'UTC';
  const today = getTodayInTimezone(timezone);

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const isViewingToday = selectedDate === today;
  const isPast = selectedDate < today;

  // If the user lingers across midnight, snap `today` and reset the date.
  useEffect(() => {
    if (selectedDate > today) setSelectedDate(today);
  }, [today, selectedDate]);

  const { data: instances = [], isLoading, toggleComplete } = useHabitsForDate(selectedDate);
  const { data: streaks } = useHabitStreaks();
  const { data: weekStatus = {} } = useWeekStatus();

  // Past days: always show all (the To-dos/Completed split makes less sense
  // when toggles are disabled). Today: respect the filter.
  const filtered = useMemo(
    () => (isPast ? instances : instances.filter((i) => (filter === 'todos' ? !i.isCompleted : i.isCompleted))),
    [instances, filter, isPast],
  );

  const buckets = useMemo<Bucket[]>(() => {
    const map = new Map<string, Bucket & { order: number }>();
    for (const inst of filtered) {
      const b = bucketOf(inst.habit.time_start);
      const existing = map.get(b.key);
      if (existing) existing.instances.push(inst);
      else map.set(b.key, { ...b, instances: [inst] });
    }
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [filtered]);

  function streakFor(id: string) {
    return streaks?.find((s) => s.habit_id === id)?.current_streak;
  }

  const remaining = instances.filter((i) => !i.isCompleted).length;
  const done = instances.filter((i) => i.isCompleted).length;

  const selectedDateObj = parseISO(selectedDate);
  const titleLabel = isViewingToday
    ? `Today, ${format(selectedDateObj, 'MMM d')}`
    : format(selectedDateObj, 'EEEE, MMM d');
  const subtitleLabel = isLoading
    ? 'Loading…'
    : isPast
      ? `${done} of ${instances.length} done`
      : remaining === 0
        ? 'All habits done · enjoy your day'
        : `${remaining} habit${remaining === 1 ? '' : 's'} left`;

  return (
    <div className="pt-4">
      <LargeTitle title={titleLabel} subtitle={subtitleLabel} />

      <div className="mt-1 mb-5">
        <WeekStrip today={today} selectedDate={selectedDate} statuses={weekStatus} onSelectDate={setSelectedDate} />
      </div>

      {isViewingToday ? (
        <div className="flex justify-center px-5">
          <SegmentedControl<Filter>
            options={[
              { value: 'todos', label: 'To-dos' },
              { value: 'completed', label: 'Completed' },
            ]}
            value={filter}
            onChange={setFilter}
          />
        </div>
      ) : (
        <div className="flex justify-center px-5">
          <button
            type="button"
            onClick={() => setSelectedDate(today)}
            className="inline-flex items-center gap-1.5 rounded-pill bg-surface-raised px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to today
          </button>
        </div>
      )}

      <div className="mt-6 space-y-7 px-5">
        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-sm text-muted">
            {isPast
              ? 'Nothing was scheduled this day.'
              : filter === 'todos'
                ? 'All done. Nice work.'
                : 'Nothing completed yet today.'}
          </p>
        )}

        <AnimatePresence mode="popLayout">
          {buckets.map((bucket) => (
            <section key={bucket.key} className="space-y-2.5">
              <h2 className="font-serif-display text-[15px] text-secondary">
                {bucket.label} <span className="text-muted">({bucket.instances.length})</span>
              </h2>
              <div className="space-y-2.5">
                {bucket.instances.map((instance) => (
                  <HabitCapsuleCard
                    key={instance.habit.id}
                    instance={instance}
                    streak={streakFor(instance.habit.id)}
                    onToggle={() => toggleComplete(instance)}
                    readOnly={isPast}
                  />
                ))}
              </div>
            </section>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
