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
          <div key={badge.id} className="flex flex-col items-center gap-1 text-center" title={badge.description}>
            <span
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full border',
                earned ? 'border-amber-400 bg-amber-500/20 text-amber-400' : 'border-surface-border text-slate-600',
              )}
            >
              <Icon size={20} />
            </span>
            <span className={cn('text-[10px]', earned ? 'text-slate-200' : 'text-slate-500')}>{badge.name}</span>
          </div>
        );
      })}
    </div>
  );
}
