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
    <div className="rounded-xl border border-surface-border bg-surface-raised p-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2"
          style={{ borderColor: info.rank.color, color: info.rank.color, backgroundColor: `${info.rank.color}1a` }}
        >
          <Shield size={22} />
        </span>
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-semibold">{info.rank.display_name}</span>
            <span className="text-sm text-slate-400">{habitPoints} HP</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-border">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${info.percent}%`, backgroundColor: info.rank.color }}
            />
          </div>
          {info.hpForNextRank != null && (
            <p className="mt-1 text-xs text-slate-400">{info.hpForNextRank} HP to next rank</p>
          )}
        </div>
      </div>
    </div>
  );
}
