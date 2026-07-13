import { motion } from 'framer-motion';
import { useId } from 'react';
import { cn } from '@/lib/utils';
import { playTapSound } from '@/lib/sound';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: SegmentedControlProps<T>) {
  const layoutId = useId();

  return (
    <div
      className={cn(
        'relative inline-flex rounded-pill bg-surface-raised p-1',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              if (!isActive) playTapSound();
              onChange(option.value);
            }}
            className={cn(
              'relative z-10 rounded-pill px-4 font-medium transition-colors',
              size === 'sm' ? 'py-1' : 'py-1.5',
              isActive ? 'text-inverse' : 'text-secondary hover:text-primary',
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-pill bg-primary"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
