import { motion } from 'framer-motion';
import { getIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { playTapSound } from '@/lib/sound';
import type { Habit } from '@/types';

interface BubbleCardProps {
  habit: Habit;
  count?: number;
  size?: number;
  onClick?: () => void;
  className?: string;
}

export function BubbleCard({ habit, count, size = 168, onClick, className }: BubbleCardProps) {
  const Icon = getIcon(habit.icon);

  return (
    <motion.button
      type="button"
      onClick={() => {
        playTapSound();
        onClick?.();
      }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn('group flex flex-col items-center gap-2 outline-none', className)}
      style={{ width: size }}
      aria-label={`Open ${habit.name}`}
    >
      <div
        className="relative flex items-center justify-center rounded-full shadow-card transition-shadow group-hover:shadow-floating"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 30% 25%, ${habit.color}40, ${habit.color}cc 65%)`,
        }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-inverse"
          aria-hidden
        >
          {count !== undefined ? (
            <span className="text-lg font-semibold">{count}</span>
          ) : (
            Icon && <Icon className="h-6 w-6" />
          )}
        </div>
      </div>
      <span className="text-[15px] font-medium text-primary">{habit.name}</span>
    </motion.button>
  );
}
