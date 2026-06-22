import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useScheduleForDay } from '@/hooks/useScheduleForDay';
import { useProfile } from '@/hooks/useProfile';
import { Timeline } from '@/components/schedule/Timeline';
import { HabitForm } from '@/components/habit/HabitForm';
import { getWeekdayInTimezone } from '@/lib/utils';
import { WEEKDAY_LABELS, type DayOfWeek } from '@/types/enums';
import type { Habit, TimeBlockEvent } from '@/types';

export default function SchedulePage() {
  const { data: profile } = useProfile();
  const todayWeekday = getWeekdayInTimezone(profile?.timezone ?? 'UTC');
  const [weekday, setWeekday] = useState<number>(todayWeekday);
  const { events, isLoading } = useScheduleForDay(weekday);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  function handleSelect(event: TimeBlockEvent) {
    setEditingHabit(event.habit);
  }

  return (
    <div className="px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => setWeekday((d) => (d + 6) % 7)} aria-label="Previous day">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">{WEEKDAY_LABELS[weekday as DayOfWeek]}</h1>
        <button onClick={() => setWeekday((d) => (d + 1) % 7)} aria-label="Next day">
          <ChevronRight size={20} />
        </button>
      </div>

      {isLoading && <p className="text-slate-400">Loading…</p>}
      {!isLoading && events.length === 0 && <p className="text-slate-400">Nothing scheduled this day.</p>}

      <Timeline events={events} onSelectEvent={handleSelect} />

      {editingHabit && (
        <div className="fixed inset-0 z-20 flex items-end bg-black/60">
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit habit</h2>
              <button onClick={() => setEditingHabit(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <HabitForm habit={editingHabit} onDone={() => setEditingHabit(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
