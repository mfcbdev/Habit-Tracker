import { Flame } from 'lucide-react';
import { getIcon } from '@/lib/icons';
import { formatTimeRange, cn } from '@/lib/utils';
import { CompletionButton } from './CompletionButton';
import type { HabitInstance } from '@/types';

interface HabitCardProps {
  instance: HabitInstance;
  streak?: number;
  onToggle: () => void;
}

export function HabitCard({ instance, streak, onToggle }: HabitCardProps) {
  const { habit, isCompleted } = instance;
  const Icon = getIcon(habit.icon);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-surface-border bg-surface-raised p-3 transition-opacity',
        isCompleted && 'opacity-60',
      )}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${habit.color}33`, color: habit.color }}
      >
        <Icon size={20} />
      </span>
      <div className="flex-1 overflow-hidden">
        <p className={cn('truncate font-medium', isCompleted && 'line-through')}>{habit.name}</p>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{formatTimeRange(habit.time_start, habit.time_end)}</span>
          {!!streak && streak > 0 && (
            <span className="flex items-center gap-0.5 text-amber-400">
              <Flame size={12} /> {streak}
            </span>
          )}
        </div>
      </div>
      <CompletionButton isCompleted={isCompleted} onToggle={onToggle} />
    </div>
  );
}
