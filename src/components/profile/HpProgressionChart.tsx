import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTokenColors } from '@/hooks/useTokenColors';
import { getRankProgress } from '@/lib/gamification';
import type { Rank, WeeklyHpSummary } from '@/types';

interface HpProgressionChartProps {
  weeklyHp: WeeklyHpSummary[];
  ranks: Rank[];
  currentHp: number;
}

interface ChartPoint {
  week: string;
  cumulative: number;
  rankLabel?: string;
  rankColor?: string;
}

export function HpProgressionChart({ weeklyHp, ranks, currentHp }: HpProgressionChartProps) {
  const colors = useTokenColors();

  const data = useMemo<ChartPoint[]>(() => {
    if (weeklyHp.length === 0) return [];
    let acc = 0;
    let prevRankOrder = -1;
    return weeklyHp.map((w) => {
      acc += w.hp_total;
      const info = getRankProgress(acc, ranks);
      const point: ChartPoint = { week: w.week_start.slice(5), cumulative: acc };
      if (info && info.rank.rank_order !== prevRankOrder) {
        point.rankLabel = info.rank.display_name;
        point.rankColor = info.rank.color;
        prevRankOrder = info.rank.rank_order;
      }
      return point;
    });
  }, [weeklyHp, ranks]);

  if (data.length === 0) {
    return (
      <div className="rounded-card bg-surface p-6 text-center text-sm text-muted shadow-card">
        No HP earned yet.
      </div>
    );
  }

  const currentInfo = getRankProgress(currentHp, ranks);

  return (
    <div className="rounded-card bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">HP progression</p>
        {currentInfo && (
          <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: currentInfo.rank.color }}>
            {currentInfo.rank.display_name}
          </span>
        )}
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="hpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.accent} stopOpacity={0.45} />
                <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: colors.muted }} stroke={colors.border} />
            <YAxis tick={{ fontSize: 10, fill: colors.muted }} width={36} stroke={colors.border} />
            <Tooltip
              contentStyle={{
                background: colors.surfaceRaised,
                border: 'none',
                fontSize: 12,
                borderRadius: 12,
                color: colors.primary,
              }}
              labelStyle={{ color: colors.secondary }}
              formatter={(value: number) => [`${value} HP`, 'Total']}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke={colors.accent}
              strokeWidth={2.5}
              fill="url(#hpGradient)"
            />
            {data
              .filter((d) => d.rankLabel)
              .map((d) => (
                <ReferenceDot
                  key={d.week}
                  x={d.week}
                  y={d.cumulative}
                  r={5}
                  fill={d.rankColor}
                  stroke={colors.surface}
                  strokeWidth={2}
                  isFront
                />
              ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
