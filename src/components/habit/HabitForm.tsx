import { useState, type FormEvent } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { mapSupabaseError } from '@/lib/errors';
import { toMinutes } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCreateHabit, useUpdateHabit } from '@/hooks/useHabits';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { IconPicker } from '@/components/ui/IconPicker';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { DAYS_OF_WEEK, WEEKDAY_LABELS } from '@/types/enums';
import { cn } from '@/lib/utils';
import type { Habit, HabitDifficulty, HabitFrequency } from '@/types';
import type { HabitFormErrors, HabitFormValues } from '@/types/forms';

const DEFAULT_VALUES: HabitFormValues = {
  name: '',
  description: '',
  purpose: '',
  category: '',
  color: '#3E8473',
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
    purpose: habit.purpose ?? '',
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

const inputBase =
  'w-full rounded-input border border-DEFAULT bg-surface-raised px-3 py-2.5 text-[15px] text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition';

const fieldLabel = 'mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted';

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
        <p className="rounded-input bg-danger/10 px-3 py-2 text-sm text-danger">{errors._overlap}</p>
      )}

      <div>
        <label className={fieldLabel}>Name</label>
        <input
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          required
          maxLength={100}
          placeholder="Read 20 pages"
          className={inputBase}
        />
        {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
      </div>

      <div>
        <label className={fieldLabel}>Description</label>
        <textarea
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          rows={2}
          className={inputBase}
        />
      </div>

      <div>
        <label className={fieldLabel}>I want this so that I can become…</label>
        <input
          value={values.purpose}
          onChange={(e) => update('purpose', e.target.value)}
          maxLength={120}
          placeholder="a mindful person"
          className={inputBase}
        />
      </div>

      <div>
        <label className={fieldLabel}>Category</label>
        <input
          value={values.category}
          onChange={(e) => update('category', e.target.value)}
          className={inputBase}
        />
      </div>

      <div>
        <label className={fieldLabel}>Color</label>
        <ColorPicker value={values.color} onChange={(color) => update('color', color)} />
      </div>

      <div>
        <label className={fieldLabel}>Icon</label>
        <IconPicker value={values.icon} onChange={(icon) => update('icon', icon)} />
      </div>

      <div>
        <label className={fieldLabel}>Frequency</label>
        <SegmentedControl
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
          ]}
          value={values.frequency}
          onChange={(f) => update('frequency', f as HabitFrequency)}
        />
      </div>

      {values.frequency === 'weekly' && (
        <div>
          <label className={fieldLabel}>Days</label>
          <div className="flex gap-1.5">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={cn(
                  'flex-1 rounded-input border px-2 py-2 text-xs font-medium transition',
                  values.frequency_days.includes(day)
                    ? 'border-accent bg-accent text-accent-contrast'
                    : 'border-DEFAULT text-secondary',
                )}
              >
                {WEEKDAY_LABELS[day]}
              </button>
            ))}
          </div>
          {errors.frequency_days && <p className="mt-1 text-xs text-danger">{errors.frequency_days}</p>}
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={fieldLabel}>Start</label>
          <input
            type="time"
            value={values.time_start}
            onChange={(e) => update('time_start', e.target.value)}
            required
            className={inputBase}
          />
        </div>
        <div className="flex-1">
          <label className={fieldLabel}>End</label>
          <input
            type="time"
            value={values.time_end}
            onChange={(e) => update('time_end', e.target.value)}
            required
            className={inputBase}
          />
          {errors.time_end && <p className="mt-1 text-xs text-danger">{errors.time_end}</p>}
        </div>
      </div>

      <div>
        <label className={fieldLabel}>Difficulty</label>
        <SegmentedControl
          options={[
            { value: 'easy', label: 'Easy' },
            { value: 'medium', label: 'Medium' },
            { value: 'hard', label: 'Hard' },
          ]}
          value={values.difficulty}
          onChange={(d) => update('difficulty', d as HabitDifficulty)}
        />
      </div>

      <div>
        <label className={fieldLabel}>Remind me before (minutes)</label>
        <input
          type="number"
          min={0}
          value={values.reminder_offset_minutes}
          onChange={(e) => update('reminder_offset_minutes', Number(e.target.value))}
          className={inputBase}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-pill bg-accent py-3.5 text-[15px] font-semibold text-accent-contrast shadow-card transition active:scale-[0.98] disabled:opacity-50"
      >
        {habit ? 'Save changes' : 'Create habit'}
      </button>
    </form>
  );
}
