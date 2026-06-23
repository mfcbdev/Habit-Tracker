import { getIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { BadgeWithStatus } from '@/types';

export function BadgeGrid({ badges }: { badges: BadgeWithStatus[] }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {badges.map((badge) => {
        const Icon = getIcon(badge.icon);
        const earned = !!badge.earnedAt;
        return (
          <div key={badge.id} className="flex flex-col items-center gap-1.5 text-center" title={badge.description}>
            <span
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full transition',
                earned ? 'bg-accent text-accent-contrast shadow-card' : 'border border-DEFAULT text-muted',
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={earned ? 2 : 1.6} />
            </span>
            <span className={cn('text-[10px] font-medium', earned ? 'text-secondary' : 'text-muted')}>{badge.name}</span>
          </div>
        );
      })}
    </div>
  );
}
