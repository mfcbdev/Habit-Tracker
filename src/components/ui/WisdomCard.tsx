import { Quote } from 'lucide-react';
import { wisdomForDate } from '@/lib/wisdom';
import { cn } from '@/lib/utils';

interface WisdomCardProps {
  date: string; // yyyy-MM-dd
  className?: string;
}

export function WisdomCard({ date, className }: WisdomCardProps) {
  const w = wisdomForDate(date);
  return (
    <blockquote
      className={cn(
        'mx-5 rounded-card border border-DEFAULT bg-surface p-4 shadow-card',
        className,
      )}
    >
      <Quote className="mb-1.5 h-3.5 w-3.5 text-muted" aria-hidden />
      <p className="font-serif-display text-[15px] leading-snug text-primary text-balance">
        {w.quote}
      </p>
      <footer className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        {w.author} · <span className="italic normal-case tracking-normal">{w.book}</span>
      </footer>
    </blockquote>
  );
}
