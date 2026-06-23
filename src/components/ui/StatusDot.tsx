import { cn } from '@/lib/utils';

export type DayStatus = 'all' | 'some' | 'none' | 'empty';

interface StatusDotProps {
  status: DayStatus;
  className?: string;
}

const EMOJI: Record<DayStatus, string> = {
  all: '😄',
  some: '🙂',
  none: '😐',
  empty: '·',
};

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex h-5 w-5 items-center justify-center text-[14px] leading-none',
        status === 'empty' && 'text-muted',
        className,
      )}
    >
      {EMOJI[status]}
    </span>
  );
}
