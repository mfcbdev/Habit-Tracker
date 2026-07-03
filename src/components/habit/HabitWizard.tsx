import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { PostgrestError } from '@supabase/supabase-js';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { mapSupabaseError } from '@/lib/errors';
import { toMinutes, cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCreateHabit } from '@/hooks/useHabits';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { IconPicker } from '@/components/ui/IconPicker';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { DAYS_OF_WEEK, WEEKDAY_LABELS } from '@/types/enums';
import { HABIT_TEMPLATES, type HabitTemplate } from '@/lib/habitTemplates';
import type { HabitDifficulty, HabitFrequency } from '@/types';
import type { HabitFormValues } from '@/types/forms';

interface HabitWizardProps {
  onDone: () => void;
}

const DEFAULTS: HabitFormValues = {
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

const STEP_LABELS = ['Template', 'Identity', 'Schedule', 'Details'];

const inputBase =
  'w-full rounded-input border border-DEFAULT bg-surface-raised px-3 py-2.5 text-[15px] text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition';
const fieldLabel = 'mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted';

export function HabitWizard({ onDone }: HabitWizardProps) {
  const { session } = useAuth();
  const createHabit = useCreateHabit();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [values, setValues] = useState<HabitFormValues>(DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setError(null);
  }

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

  function pickTemplate(t: HabitTemplate) {
    setValues(t.values);
    goTo(1);
  }

  function skipTemplate() {
    setValues(DEFAULTS);
    goTo(1);
  }

  function validateStep(current: number): string | null {
    if (current === 1) {
      if (!values.name.trim()) return 'Give your habit a name.';
      if (values.name.length > 100) return 'Name is too long.';
    }
    if (current === 2) {
      if (values.time_end <= values.time_start) return 'End time must be after start.';
      if (values.frequency === 'weekly' && values.frequency_days.length === 0)
        return 'Pick at least one day.';
    }
    return null;
  }

  async function handleNext() {
    const err = validateStep(step);
    if (err) return setError(err);
    if (step < STEP_LABELS.length - 1) return goTo(step + 1);
    await handleCreate();
  }

  async function checkOverlap(): Promise<string | null> {
    const userId = session!.user.id;
    const { data } = await supabase
      .from('habits')
      .select('id, name, time_start, time_end, frequency_days')
      .eq('user_id', userId)
      .eq('is_active', true);
    if (!data) return null;
    const newStart = toMinutes(values.time_start);
    const newEnd = toMinutes(values.time_end);
    const newDays = values.frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : values.frequency_days;
    for (const other of data) {
      const sharesDay = other.frequency_days.some((d) => newDays.includes(d));
      if (!sharesDay) continue;
      const otherStart = toMinutes(other.time_start);
      const otherEnd = toMinutes(other.time_end);
      if (otherStart < newEnd && otherEnd > newStart) return `Overlaps with "${other.name}" on a shared day.`;
    }
    return null;
  }

  async function handleCreate() {
    setIsSubmitting(true);
    setError(null);
    try {
      const overlap = await checkOverlap();
      if (overlap) return setError(overlap);
      await createHabit.mutateAsync(values);
      onDone();
    } catch (err) {
      const mapped = mapSupabaseError(err as PostgrestError);
      setError(mapped.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <ProgressDots step={step} total={STEP_LABELS.length} />

      <div className="min-h-[280px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -32 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            {step === 0 && <StepTemplate onPick={pickTemplate} onSkip={skipTemplate} />}
            {step === 1 && (
              <StepIdentity values={values} update={update} />
            )}
            {step === 2 && (
              <StepSchedule values={values} update={update} toggleDay={toggleDay} />
            )}
            {step === 3 && <StepDetails values={values} update={update} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {error && (
        <p className="rounded-input bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {step > 0 && (
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="inline-flex items-center gap-1 rounded-pill px-3 py-2 text-sm font-medium text-secondary"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="ml-auto rounded-pill bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast shadow-card active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Creating…' : step === STEP_LABELS.length - 1 ? 'Create habit' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all',
            i === step ? 'w-6 bg-accent' : i < step ? 'w-1.5 bg-accent/50' : 'w-1.5 bg-border',
          )}
        />
      ))}
    </div>
  );
}

/* ---------------------------- steps ---------------------------- */

function StepTemplate({
  onPick,
  onSkip,
}: {
  onPick: (t: HabitTemplate) => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-4">
      <header className="text-center">
        <h2 className="font-serif-display text-[22px] leading-tight text-primary">
          Start from a template
        </h2>
        <p className="mt-1 text-sm text-muted">Curated from books that shaped habit science.</p>
      </header>

      <div className="grid grid-cols-1 gap-2.5">
        {HABIT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(t)}
            className="rounded-card border border-DEFAULT bg-surface p-3 text-left shadow-card transition hover:border-accent"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none" aria-hidden>
                {t.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-serif-display text-[16px] leading-tight text-primary">
                  {t.headline}
                </p>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                  {t.author}
                </p>
                <p className="mt-1.5 text-[13px] leading-snug text-secondary">{t.principle}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="mx-auto flex items-center gap-1.5 rounded-pill border border-DEFAULT px-4 py-2 text-sm font-medium text-secondary"
      >
        <Sparkles className="h-3.5 w-3.5" /> Start from scratch
      </button>
    </div>
  );
}

function StepIdentity({
  values,
  update,
}: {
  values: HabitFormValues;
  update: <K extends keyof HabitFormValues>(k: K, v: HabitFormValues[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">Step 2 · Identity</p>
        <h2 className="mt-1 font-serif-display text-[22px] leading-tight text-primary">
          Who are you becoming?
        </h2>
      </header>

      <div>
        <label className={fieldLabel}>The habit</label>
        <input
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Read 20 pages"
          maxLength={100}
          autoFocus
          className={inputBase}
        />
      </div>

      <div>
        <label className={fieldLabel}>I want this so that I can become…</label>
        <input
          value={values.purpose}
          onChange={(e) => update('purpose', e.target.value)}
          placeholder="a mindful person"
          maxLength={120}
          className={inputBase}
        />
      </div>

      <div>
        <label className={fieldLabel}>Why this matters (optional)</label>
        <textarea
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
          placeholder="Compound growth over one year is 37x — one page a day is enough."
          className={inputBase}
        />
      </div>
    </div>
  );
}

function StepSchedule({
  values,
  update,
  toggleDay,
}: {
  values: HabitFormValues;
  update: <K extends keyof HabitFormValues>(k: K, v: HabitFormValues[K]) => void;
  toggleDay: (day: number) => void;
}) {
  return (
    <div className="space-y-4">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">Step 3 · Schedule</p>
        <h2 className="mt-1 font-serif-display text-[22px] leading-tight text-primary">
          When will you do it?
        </h2>
      </header>

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
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={fieldLabel}>Start</label>
          <input
            type="time"
            value={values.time_start}
            onChange={(e) => update('time_start', e.target.value)}
            className={inputBase}
          />
        </div>
        <div className="flex-1">
          <label className={fieldLabel}>End</label>
          <input
            type="time"
            value={values.time_end}
            onChange={(e) => update('time_end', e.target.value)}
            className={inputBase}
          />
        </div>
      </div>
    </div>
  );
}

function StepDetails({
  values,
  update,
}: {
  values: HabitFormValues;
  update: <K extends keyof HabitFormValues>(k: K, v: HabitFormValues[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">Step 4 · Details</p>
        <h2 className="mt-1 font-serif-display text-[22px] leading-tight text-primary">
          Make it yours
        </h2>
      </header>

      <div>
        <label className={fieldLabel}>Color</label>
        <ColorPicker value={values.color} onChange={(c) => update('color', c)} />
      </div>

      <div>
        <label className={fieldLabel}>Icon</label>
        <IconPicker value={values.icon} onChange={(i) => update('icon', i)} />
      </div>

      <div>
        <label className={fieldLabel}>Difficulty</label>
        <SegmentedControl
          options={[
            { value: 'easy', label: 'Easy · 10 HP' },
            { value: 'medium', label: 'Medium · 25 HP' },
            { value: 'hard', label: 'Hard · 50 HP' },
          ]}
          value={values.difficulty}
          onChange={(d) => update('difficulty', d as HabitDifficulty)}
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={fieldLabel}>Category</label>
          <input
            value={values.category}
            onChange={(e) => update('category', e.target.value)}
            placeholder="Health"
            className={inputBase}
          />
        </div>
        <div className="flex-1">
          <label className={fieldLabel}>Remind me (min)</label>
          <input
            type="number"
            min={0}
            value={values.reminder_offset_minutes}
            onChange={(e) => update('reminder_offset_minutes', Number(e.target.value))}
            className={inputBase}
          />
        </div>
      </div>
    </div>
  );
}
