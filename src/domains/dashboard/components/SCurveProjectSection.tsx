'use client';

import { type ComponentProps, type ReactNode } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { DASHBOARD_LABELS, SCURVE_ACTUAL_LINE_ADJUSTMENT_ENABLED } from '../constants';
import { useDashboardProjectOverview } from '../hooks/use-dashboard-project-overview';
import { formatSCurvePercent } from '../services/format';
import {
  ensureSCurveActualTableRow,
  getSCurveSeriesLabel,
  normalizeSCurveChartPoints,
} from '../services/s-curve';
import { getStatusColorMeta } from '../services/status-color';
import type {
  DashboardSCurve,
  DashboardSCurveChartPoint,
  SCurvePeriodMode,
  SCurveSeriesKey,
} from '../types';
import { SectionError, TableCardSkeleton } from './DashboardSectionUI';

const SCURVE_CHART_CONFIG = {
  originalPlan: {
    label: DASHBOARD_LABELS.SCURVE.SERIES_ORIGINAL_PLAN,
    color: 'var(--color-green-600)',
  },
  currentPlan: {
    label: DASHBOARD_LABELS.SCURVE.SERIES_CURRENT_PLAN,
    color: 'var(--color-primary)',
  },
  actual: {
    label: DASHBOARD_LABELS.SCURVE.SERIES_ACTUAL,
    color: 'var(--color-primary)',
  },
} as const;

const SERIES_KEYS: SCurveSeriesKey[] = ['originalPlan', 'currentPlan', 'actual'];

const SERIES_SWATCHES: Record<SCurveSeriesKey, ReactNode> = {
  originalPlan: <OriginalPlanSwatch />,
  currentPlan: <CurrentPlanSwatch />,
  actual: <ActualSwatch />,
};

const SUMMARY_STATS = [
  { key: 'planned', label: DASHBOARD_LABELS.COMMON.PLANNED },
  { key: 'actual', label: DASHBOARD_LABELS.COMMON.ACTUAL },
  { key: 'variance', label: DASHBOARD_LABELS.COMMON.VARIANCE },
] as const;

interface LineDotProps {
  cx?: number;
  cy?: number;
}

interface SCurveProjectSectionProps {
  interval: SCurvePeriodMode;
  onIntervalChange: (mode: SCurvePeriodMode) => void;
  projectId?: string;
}

export function SCurveProjectSection({
  interval,
  onIntervalChange,
  projectId,
}: SCurveProjectSectionProps) {
  const { data, error, isPending, refetch } = useDashboardProjectOverview({
    projectId,
    interval,
  });

  if (isPending) {
    return (
      <Card className="border-slate-200 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-950">
            {DASHBOARD_LABELS.SCURVE.TITLE}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TableCardSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-slate-200 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-950">
            {DASHBOARD_LABELS.SCURVE.TITLE}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SectionError error={error} onRetry={refetch} />
        </CardContent>
      </Card>
    );
  }

  return (
    <SCurveProjectSectionView data={data.sCurve} mode={interval} onModeChange={onIntervalChange} />
  );
}

function SCurveProjectSectionView({
  data,
  mode,
  onModeChange,
}: {
  data: DashboardSCurve;
  mode: SCurvePeriodMode;
  onModeChange: (mode: SCurvePeriodMode) => void;
}) {
  const points = SCURVE_ACTUAL_LINE_ADJUSTMENT_ENABLED
    ? normalizeSCurveChartPoints(data.chartData)
    : data.chartData;
  const tableRows = SCURVE_ACTUAL_LINE_ADJUSTMENT_ENABLED
    ? ensureSCurveActualTableRow(data)
    : data.table.rows;
  const statusBadgeVariant = getStatusColorMeta(data.summary.statusColor).badgeVariant;

  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-slate-950">
              {DASHBOARD_LABELS.SCURVE.TITLE}
            </CardTitle>
            <CardDescription>{data.project.subtitle}</CardDescription>
          </div>
          <PeriodModeToggle mode={mode} onModeChange={onModeChange} />
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
          {SUMMARY_STATS.map((stat) => (
            <div className="flex items-center gap-2" key={stat.key}>
              <span className="text-sm text-slate-500">{stat.label}</span>
              <span className="text-sm font-semibold tabular-nums text-slate-950">
                {formatSCurvePercent(data.summary[stat.key])}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{DASHBOARD_LABELS.COMMON.STATUS}</span>
            <Badge variant={statusBadgeVariant}>{data.summary.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer
          className="aspect-auto h-[320px] w-full"
          config={SCURVE_CHART_CONFIG}
          id="s-curve-project"
        >
          <LineChart
            accessibilityLayer
            data={points}
            margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              axisLine={false}
              dataKey="period"
              minTickGap={24}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value: number) => `${value}%`}
              tickLine={false}
              width={40}
            />
            <ChartTooltip cursor={false} content={<SCurveTooltipContent indicator="line" />} />
            <Line
              connectNulls={false}
              dataKey="originalPlan"
              dot={renderTriangleDot}
              stroke="var(--color-originalPlan)"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              connectNulls={false}
              dataKey="currentPlan"
              dot={renderCircleDot}
              stroke="var(--color-currentPlan)"
              strokeDasharray="6 6"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              connectNulls={false}
              dataKey="actual"
              dot={false}
              stroke="var(--color-actual)"
              strokeWidth={2.5}
              type="monotone"
            />
          </LineChart>
        </ChartContainer>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {SERIES_KEYS.map((seriesKey) => (
            <div className="flex items-center gap-2" key={seriesKey}>
              {SERIES_SWATCHES[seriesKey]}
              <span className="text-sm text-slate-600">
                {getSCurveSeriesLabel(data, seriesKey)}
              </span>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]" />
                {data.table.periods.map((period) => (
                  <TableHead key={period} className="min-w-[64px] text-center">
                    {period}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row) => (
                <TableRow key={row.type}>
                  <TableCell className="min-w-[120px]">{getSeriesSwatch(row.type)}</TableCell>
                  {row.values.map((value, index) => (
                    <TableCell
                      className="text-center tabular-nums"
                      key={`${row.type}-${data.table.periods[index] ?? index}`}
                    >
                      {formatSCurvePercent(value)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function SCurveTooltipContent(props: ComponentProps<typeof ChartTooltipContent>) {
  const { active, payload } = props;
  if (!active || !payload?.length) {
    return <ChartTooltipContent {...props} />;
  }

  const point = payload[0]?.payload as Partial<DashboardSCurveChartPoint> | undefined;
  const filledPayload = SERIES_KEYS.map((seriesKey) => {
    const existing = payload.find((item) => String(item.dataKey) === seriesKey);
    if (existing) {
      return existing;
    }

    return {
      dataKey: seriesKey,
      name: seriesKey,
      color: `var(--color-${seriesKey})`,
      value: point?.[seriesKey] ?? 0,
      payload: point,
    } as (typeof payload)[number];
  });

  return <ChartTooltipContent {...props} payload={filledPayload} />;
}

function getSeriesSwatch(type: string): ReactNode {
  if (type in SERIES_SWATCHES) {
    return SERIES_SWATCHES[type as SCurveSeriesKey];
  }

  return <ActualSwatch />;
}

function PeriodModeToggle({
  mode,
  onModeChange,
}: {
  mode: SCurvePeriodMode;
  onModeChange: (mode: SCurvePeriodMode) => void;
}) {
  const options = [
    { label: DASHBOARD_LABELS.SCURVE.TOGGLE_WEEKLY, value: 'weekly' },
    { label: DASHBOARD_LABELS.SCURVE.TOGGLE_MONTHLY, value: 'monthly' },
  ] as const;

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
      {options.map((option) => (
        <Button
          className="h-7 px-3"
          key={option.value}
          onClick={() => {
            onModeChange(option.value);
          }}
          size="sm"
          type="button"
          variant={option.value === mode ? 'default' : 'ghost'}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function renderTriangleDot(props: LineDotProps) {
  const { cx, cy } = props;
  if (cx === undefined || cy === undefined) {
    return null;
  }

  const radius = 5;
  const points = [
    `${cx},${cy - radius}`,
    `${cx + radius},${cy + radius * 0.8}`,
    `${cx - radius},${cy + radius * 0.8}`,
  ].join(' ');

  return <polygon fill="white" points={points} stroke="var(--color-green-600)" strokeWidth={1.5} />;
}

function renderCircleDot(props: LineDotProps) {
  const { cx, cy } = props;
  if (cx === undefined || cy === undefined) {
    return null;
  }

  return (
    <circle cx={cx} cy={cy} fill="white" r={4} stroke="var(--color-primary)" strokeWidth={1.5} />
  );
}

function OriginalPlanSwatch() {
  return (
    <svg aria-hidden="true" className="h-3 w-6 shrink-0" viewBox="0 0 24 12">
      <line stroke="var(--color-green-600)" strokeWidth={2} x1={0} x2={24} y1={6} y2={6} />
      <polygon
        fill="white"
        points="12,2 16,10 8,10"
        stroke="var(--color-green-600)"
        strokeWidth={1.5}
      />
    </svg>
  );
}

function CurrentPlanSwatch() {
  return (
    <svg aria-hidden="true" className="h-3 w-6 shrink-0" viewBox="0 0 24 12">
      <line
        stroke="var(--color-primary)"
        strokeDasharray="4 3"
        strokeWidth={2}
        x1={0}
        x2={24}
        y1={6}
        y2={6}
      />
      <circle cx={12} cy={6} fill="white" r={3} stroke="var(--color-primary)" strokeWidth={1.5} />
    </svg>
  );
}

function ActualSwatch() {
  return (
    <svg aria-hidden="true" className="h-3 w-6 shrink-0" viewBox="0 0 24 12">
      <line stroke="var(--color-primary)" strokeWidth={2.5} x1={0} x2={24} y1={6} y2={6} />
    </svg>
  );
}
