import { cn } from '@/lib/utils';

interface LargeTitleProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center';
}

export function LargeTitle({ title, eyebrow, subtitle, className, align = 'left' }: LargeTitleProps) {
  return (
    <header
      className={cn('flex flex-col gap-1.5 px-5 pt-2 pb-4', align === 'center' && 'items-center text-center', className)}
    >
      {eyebrow && (
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{eyebrow}</span>
      )}
      <h1 className="font-serif-display text-[34px] leading-[1.05] font-medium text-primary text-balance">
        {title}
      </h1>
      {subtitle && <p className="text-[15px] text-secondary">{subtitle}</p>}
    </header>
  );
}
