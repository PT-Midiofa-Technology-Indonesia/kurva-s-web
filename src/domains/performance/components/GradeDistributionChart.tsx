'use client';

// Trend icons removed - not used in current implementation
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/components/ui/chart';
// GRADE_COLORS not used - using GRADE_FILL_COLORS instead
import { PERFORMANCE_LABELS } from '../constants';
import type { GradeDistribution } from '../types';

interface GradeDistributionChartProps {
  grades: GradeDistribution[];
  className?: string;
}

const CHART_CONFIG = {
  percentage: {
    label: PERFORMANCE_LABELS.CHART.PERCENTAGE,
  },
};

// Map grade colors to chart fill colors
const GRADE_FILL_COLORS: Record<string, string> = {
  A: 'hsl(142, 76%, 36%)', // green-600
  B: 'hsl(217, 91%, 60%)', // blue-600
  C: 'hsl(45, 93%, 47%)', // yellow-600
  D: 'hsl(25, 95%, 53%)', // orange-600
  E: 'hsl(0, 84%, 60%)', // red-600
};

export function GradeDistributionChart({ grades, className }: GradeDistributionChartProps) {
  // Transform data for horizontal bar chart (reverse for top-to-bottom A-E)
  const chartData = [...grades].reverse().map((g) => ({
    grade: g.grade,
    percentage: g.percentage,
    count: g.count,
  }));

  return (
    <div className={className}>
      <ChartContainer config={CHART_CONFIG} className="h-[280px] w-full">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="grade" width={40} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, _name, item) => (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Grade {item.payload.grade}:</span>
                      <span>{value}%</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.payload.count} {PERFORMANCE_LABELS.CHART.EMPLOYEES}
                    </div>
                  </>
                )}
              />
            }
          />
          <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.grade} fill={GRADE_FILL_COLORS[entry.grade]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {grades.map((g) => (
          <div
            key={g.grade}
            className="flex flex-col items-center gap-1 rounded-lg border bg-slate-50 p-2"
          >
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold" style={{ color: GRADE_FILL_COLORS[g.grade] }}>
                {g.grade}
              </span>
            </div>
            <span className="text-lg font-bold text-slate-900">{g.count}</span>
            <span className="text-xs text-slate-500">{g.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
