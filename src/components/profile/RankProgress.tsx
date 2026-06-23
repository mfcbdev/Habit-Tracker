import { Shield } from 'lucide-react';
import { getRankProgress } from '@/lib/gamification';
import type { Rank } from '@/types';

interface RankProgressProps {
  habitPoints: number;
  ranks: Rank[];
}

export function RankProgress({ habitPoints, ranks }: RankProgressProps) {
  const info = getRankProgress(habitPoints, ranks);
  if (!info) return null;

  return (
    <div className="rounded-card bg-surface p-5 shadow-card">
      <div className="flex items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${info.rank.color}1f`, color: info.rank.color }}
        >
          <Shield className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Current rank</p>
          <p className="font-serif-display text-[22px] leading-tight text-primary">{info.rank.display_name}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted">HP</p>
          <p className="font-serif-display text-[22px] text-primary">{habitPoints}</p>
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface-raised">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${info.percent}%`, backgroundColor: info.rank.color }}
        />
      </div>
      {info.hpForNextRank != null && (
        <p className="mt-2 text-xs text-muted">{info.hpForNextRank} HP to next rank</p>
      )}
    </div>
  );
}
