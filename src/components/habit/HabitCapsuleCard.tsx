import { motion } from 'framer-motion';
import { Flame, Check, X } from 'lucide-react';
import { fireCompletionConfetti } from './CompletionAnimation';
import { cn } from '@/lib/utils';
import type { HabitInstance } from '@/types';

interface HabitCapsuleCardProps {
  instance: HabitInstance;
  streak?: number;
  onToggle: () => void;
  /** When true, the toggle is disabled and a different visual marks the state. */
  readOnly?: boolean;
}

export function HabitCapsuleCard({ instance, streak, onToggle, readOnly = false }: HabitCapsuleCardProps) {
  const { habit, isCompleted } = instance;
  const eyebrowLabel =
    habit.frequency === 'daily' ? 'EVERY DAY' : `${habit.frequency_days.length} DAYS / WEEK`;
  const timeLabel = habit.time_start.slice(0, 5);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (readOnly) return;
    if (!isCompleted) {
      const rect = e.currentTarget.getBoundingClientRect();
      fireCompletionConfetti({
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      });
    }
    onToggle();
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className={cn(
        'flex items-center gap-3 rounded-card px-4 py-3.5 shadow-card transition',
        isCompleted ? 'bg-surface-raised opacity-80' : 'bg-surface',
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {eyebrowLabel} · {timeLabel}
        </p>
        <p
          className={cn(
            'mt-1 font-serif-display text-[20px] leading-tight text-primary',
            isCompleted && 'line-through',
          )}
          style={{ color: isCompleted ? undefined : habit.color }}
        >
          {habit.name}
        </p>
        {streak !== undefined && streak > 0 && !readOnly && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <Flame className="h-3 w-3" /> {streak}-day streak
          </p>
        )}
        {readOnly && (
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted">
            {isCompleted ? 'Completed' : 'Missed'}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={readOnly}
        aria-pressed={isCompleted}
        aria-label={isCompleted ? 'Mark as not done' : 'Mark as done'}
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition',
          isCompleted
            ? 'border-success bg-success text-accent-contrast'
            : readOnly
              ? 'border-DEFAULT text-muted'
              : 'border-DEFAULT text-transparent',
          readOnly && 'cursor-default',
        )}
      >
        {isCompleted ? <Check className="h-5 w-5" strokeWidth={3} /> : readOnly ? <X className="h-4 w-4" /> : <Check className="h-5 w-5" strokeWidth={3} />}
      </button>
    </motion.div>
  );
}
