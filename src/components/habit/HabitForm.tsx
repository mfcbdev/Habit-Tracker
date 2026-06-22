import { useState, type FormEvent } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { mapSupabaseError } from '@/lib/errors';
import { toMinutes } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCreateHabit, useUpdateHabit } from '@/hooks/useHabits';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { IconPicker } from '@/components/ui/IconPicker';
import { DAYS_OF_WEEK, WEEKDAY_LABELS } from '@/types/enums';
import { cn } from '@/lib/utils';
import type { Habit, HabitDifficulty, HabitFrequency } from '@/types';
import type { HabitFormErrors, HabitFormValues } from '@/types/forms';

const DEFAULT_VALUES: HabitFormValues = {
  name: '',
  description: '',
  category: '',
  color: '#6366f1',
  icon: 'circle',
  frequency: 'daily',
  frequency_days: [0, 1, 2, 3, 4, 5, 6],
  time_start: '07:00',
  time_end: '07:30',
  difficulty: 'medium',
  reminder_offset_minutes: 10,
};

function fromHabit(habit: Habit): HabitFormValues {
  return {
    name: habit.name,
    description: habit.description ?? '',
    category: habit.category ?? '',
    color: habit.color,
    icon: habit.icon,
    frequency: habit.frequency,
    frequency_days: habit.frequency_days,
    time_start: habit.time_start.slice(0, 5),
    time_end: habit.time_end.slice(0, 5),
    difficulty: habit.difficulty,
    reminder_offset_minutes: habit.reminder_offset_minutes,
  };
}

interface HabitFormProps {
  habit?: Habit;
  onDone: () => void;
}

export function HabitForm({ habit, onDone }: HabitFormProps) {
  const { session } = useAuth();
  const [values, setValues] = useState<HabitFormValues>(habit ? fromHabit(habit) : DEFAULT_VALUES);
  const [errors, setErrors] = useState<HabitFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();

  function update<K extends keyof HabitFormValues>(key: K, value: HabitFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDay(day: number) {
    setValues((prev) => ({
      ...prev,
      frequency_days: prev.frequency_days.includes(day)
        ? prev.frequency_days.filter((d) => d !== day)
        : [...prev.frequency_days, day].sort(),
    }));
  }

  async function checkClientSideOverlap(): Promise<string | null> {
    const userId = session!.user.id;
    const { data, error } = await supabase
      .from('habits')
      .select('id, name, time_start, time_end, frequency_days')
      .eq('user_id', userId)
      .eq('is_active', true);
    if (error || !data) return null;

    const newStart = toMinutes(values.time_start);
    const newEnd = toMinutes(values.time_end);
    const newDays = values.frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : values.frequency_days;

    for (const other of data) {
      if (habit && other.id === habit.id) continue;
      const sharesDay = other.frequency_days.some((d) => newDays.includes(d));
      if (!sharesDay) continue;
      const otherStart = toMinutes(other.time_start);
      const otherEnd = toMinutes(other.time_end);
      if (otherStart < newEnd && otherEnd > newStart) {
        return `This overlaps with "${other.name}" on a shared day.`;
      }
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    if (values.time_end <= values.time_start) {
      setErrors({ time_end: 'End time must be after start time.' });
      return;
    }
    if (values.frequency === 'weekly' && values.frequency_days.length === 0) {
      setErrors({ frequency_days: 'Select at least one day.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const overlapMessage = await checkClientSideOverlap();
      if (overlapMessage) {
        setErrors({ _overlap: overlapMessage });
        return;
      }

      if (habit) {
        await updateHabit.mutateAsync({ id: habit.id, values });
      } else {
        await createHabit.mutateAsync(values);
      }
      onDone();
    } catch (err) {
      const mapped = mapSupabaseError(err as PostgrestError);
      setErrors({ [mapped.field ?? '_overlap']: mapped.message } as HabitFormErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors._overlap && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{errors._overlap}</p>
      )}

      <div>
        <label className="mb-1 block text-sm text-slate-400">Name</label>
        <input
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          required
          maxLength={100}
          className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2"
        />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Category</label>
        <input
          value={values.category}
          onChange={(e) => update('category', e.target.value)}
          className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Color</label>
        <ColorPicker value={values.color} onChange={(color) => update('color', color)} />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Icon</label>
        <IconPicker value={values.icon} onChange={(icon) => update('icon', icon)} />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Frequency</label>
        <div className="flex gap-2">
          {(['daily', 'weekly'] as HabitFrequency[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => update('frequency', f)}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 capitalize',
                values.frequency === f ? 'border-indigo-400 bg-indigo-500/20' : 'border-surface-border',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {values.frequency === 'weekly' && (
        <div>
          <label className="mb-1 block text-sm text-slate-400">Days</label>
          <div className="flex gap-1">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={cn(
                  'flex-1 rounded-lg border px-2 py-2 text-xs',
                  values.frequency_days.includes(day) ? 'border-indigo-400 bg-indigo-500/20' : 'border-surface-border',
                )}
              >
                {WEEKDAY_LABELS[day]}
              </button>
            ))}
          </div>
          {errors.frequency_days && <p className="mt-1 text-xs text-red-400">{errors.frequency_days}</p>}
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-sm text-slate-400">Start</label>
          <input
            type="time"
            value={values.time_start}
            onChange={(e) => update('time_start', e.target.value)}
            required
            className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm text-slate-400">End</label>
          <input
            type="time"
            value={values.time_end}
            onChange={(e) => update('time_end', e.target.value)}
            required
            className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2"
          />
          {errors.time_end && <p className="mt-1 text-xs text-red-400">{errors.time_end}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Difficulty</label>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as HabitDifficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => update('difficulty', d)}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 capitalize',
                values.difficulty === d ? 'border-indigo-400 bg-indigo-500/20' : 'border-surface-border',
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Remind me before (minutes)</label>
        <input
          type="number"
          min={0}
          value={values.reminder_offset_minutes}
          onChange={(e) => update('reminder_offset_minutes', Number(e.target.value))}
          className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-indigo-500 py-3 font-medium disabled:opacity-50"
      >
        {habit ? 'Save changes' : 'Create habit'}
      </button>
    </form>
  );
}
