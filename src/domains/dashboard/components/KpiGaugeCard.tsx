'use client';

import { Cell, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, ChartContainer } from '@/components/ui';
import { cn } from '@/utils/cn';
import { DASHBOARD_LABELS } from '../constants';
import { formatPercent } from '../services/format';

interface KpiGaugeCardProps {
  label: string;
  statusChartColor: string;
  statusDotClass: string;
  statusLabel: string;
  supportingLabel?: string;
  value: number | null;
}

export function KpiGaugeCard({
  label,
  statusChartColor,
  statusDotClass,
  statusLabel,
  supportingLabel,
  value,
}: KpiGaugeCardProps) {
  const chartConfig = {
    filled: {
      label,
      color: statusChartColor,
    },
    remaining: {
      label: DASHBOARD_LABELS.KPI.GAUGE_REMAINING,
      color: 'var(--color-slate-200)',
    },
  } as const;

  const filledValue = value === null ? 0 : Math.min(Math.max(value, 0), 100);
  const remainingValue = value === null ? 100 : Math.max(0, 100 - filledValue);
  const chartData = [
    { name: 'filled', value: filledValue },
    { name: 'remaining', value: remainingValue },
  ];

  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-950">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          <ChartContainer
            className="h-[70px] w-[70px] shrink-0"
            config={chartConfig}
            id={`kpi-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          >
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={22}
                outerRadius={34}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={`var(--color-${entry.name})`}
                    className="outline-none"
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="min-w-0 space-y-1">
            <div className="text-[24px] font-semibold leading-none tracking-tight text-slate-950">
              {value === null ? '--' : formatPercent(value)}
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', statusDotClass)} />
              <span className="text-sm font-medium text-slate-900">{statusLabel}</span>
            </div>
            {supportingLabel ? <p className="text-sm text-slate-500">{supportingLabel}</p> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
