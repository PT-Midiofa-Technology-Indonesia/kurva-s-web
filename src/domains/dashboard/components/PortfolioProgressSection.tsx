'use client';

import { Activity, ArrowRight, BarChart3, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui';
import { cn } from '@/utils/cn';
import { DASHBOARD_LABELS } from '../constants';
import { useDashboardProjectProgress } from '../hooks/use-dashboard-project-progress';
import { formatPercent, formatSignedPercentage } from '../services/format';
import type {
  DashboardProjectProgressAttentionItem,
  DashboardProjectStatus,
  SummaryTone,
} from '../types';
import {
  EmptyState,
  MetricCard,
  PortfolioSectionSkeleton,
  SectionError,
  SectionHeader,
} from './DashboardSectionUI';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

const PROJECT_STATUS_META: Record<
  DashboardProjectStatus,
  {
    label: string;
    badge: BadgeVariant;
    chipClass: string;
    tone: SummaryTone;
  }
> = {
  on_track: {
    label: DASHBOARD_LABELS.PORTFOLIO_PROGRESS.STATUS.ON_TRACK,
    badge: 'success',
    chipClass: 'border-green-200 bg-green-50 text-green-700',
    tone: 'green',
  },
  attention: {
    label: DASHBOARD_LABELS.PORTFOLIO_PROGRESS.STATUS.ATTENTION,
    badge: 'warning',
    chipClass: 'border-amber-200 bg-amber-50 text-amber-700',
    tone: 'amber',
  },
  delayed: {
    label: DASHBOARD_LABELS.PORTFOLIO_PROGRESS.STATUS.DELAYED,
    badge: 'destructive',
    chipClass: 'border-destructive/20 bg-destructive/10 text-destructive',
    tone: 'red',
  },
  unmeasured: {
    label: DASHBOARD_LABELS.PORTFOLIO_PROGRESS.STATUS.UNMEASURED,
    badge: 'outline',
    chipClass: 'border-slate-200 bg-slate-50 text-slate-600',
    tone: 'slate',
  },
};

const PROGRESS_CHART_CONFIG = {
  onTrack: {
    label: 'On track',
    color: 'var(--color-green-600)',
  },
  attention: {
    label: 'Attention',
    color: 'var(--color-amber-500)',
  },
  delayed: {
    label: 'Delayed',
    color: 'var(--color-destructive-600)',
  },
} as const;

interface PortfolioProgressSectionProps {
  companyId: string;
  showBadges?: boolean;
  showProgressDistribution?: boolean;
  showRequiresAttention?: boolean;
}

export function PortfolioProgressSection({
  companyId,
  showBadges = false,
  showProgressDistribution = false,
  showRequiresAttention = false,
}: PortfolioProgressSectionProps) {
  const { data, error, isPending, refetch } = useDashboardProjectProgress(companyId);

  const progressData = data?.portfolio.progressDistribution ?? [];
  const attentionItems = useMemo(
    () =>
      [...(data?.requiresAttention ?? [])]
        .sort((left, right) => {
          const rank = getProjectStatusRank(right.status) - getProjectStatusRank(left.status);
          if (rank !== 0) return rank;
          return (left.variance ?? 0) - (right.variance ?? 0);
        })
        .slice(0, 3),
    [data?.requiresAttention]
  );

  return (
    <>
      <SectionHeader
        description={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.DESCRIPTION}
        title={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.TITLE}
      />
      {error ? (
        <SectionError
          error={error}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : isPending || !data ? (
        <PortfolioSectionSkeleton />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              detail={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.DETAIL_PLANNED}
              icon={TrendingUp}
              label={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.METRIC_PLANNED}
              tone="brand"
              value={formatPercent(data.portfolio.plannedProgress)}
            />
            <MetricCard
              detail={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.DETAIL_ACTUAL}
              icon={Activity}
              label={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.METRIC_ACTUAL}
              tone="green"
              value={formatPercent(data.portfolio.actualProgress)}
            />
            <MetricCard
              detail={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.DETAIL_VARIANCE}
              icon={BarChart3}
              label={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.METRIC_VARIANCE}
              tone={getVarianceTone(data.portfolio.variance)}
              value={formatSignedPercentage(data.portfolio.variance)}
            />
            <MetricCard
              icon={Target}
              label={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.METRIC_STATUS}
              tone={PROJECT_STATUS_META[data.portfolio.status].tone}
              value={PROJECT_STATUS_META[data.portfolio.status].label}
            />
          </div>

          {showBadges ? (
            <div className="flex flex-wrap gap-2">
              <Badge
                className={PROJECT_STATUS_META.on_track.chipClass}
                variant={PROJECT_STATUS_META.on_track.badge}
              >
                On track {data.portfolio.statusDistribution.onTrack.count}
                {data.portfolio.statusDistribution.onTrack.percentage === null
                  ? ''
                  : ` (${formatPercent(data.portfolio.statusDistribution.onTrack.percentage)})`}
              </Badge>
              <Badge
                className={PROJECT_STATUS_META.attention.chipClass}
                variant={PROJECT_STATUS_META.attention.badge}
              >
                Attention {data.portfolio.statusDistribution.attention.count}
                {data.portfolio.statusDistribution.attention.percentage === null
                  ? ''
                  : ` (${formatPercent(data.portfolio.statusDistribution.attention.percentage)})`}
              </Badge>
              <Badge
                className={PROJECT_STATUS_META.delayed.chipClass}
                variant={PROJECT_STATUS_META.delayed.badge}
              >
                Delayed {data.portfolio.statusDistribution.delayed.count}
                {data.portfolio.statusDistribution.delayed.percentage === null
                  ? ''
                  : ` (${formatPercent(data.portfolio.statusDistribution.delayed.percentage)})`}
              </Badge>
            </div>
          ) : null}

          {showProgressDistribution ? (
            <Card className="border-slate-200 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-950">
                  {DASHBOARD_LABELS.PORTFOLIO_PROGRESS.PROGRESS_DISTRIBUTION_TITLE}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {progressData.length === 0 ? (
                  <EmptyState
                    description={
                      DASHBOARD_LABELS.PORTFOLIO_PROGRESS.PROGRESS_DISTRIBUTION_EMPTY_DESCRIPTION
                    }
                    title={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.PROGRESS_DISTRIBUTION_EMPTY_TITLE}
                  />
                ) : (
                  <ChartContainer
                    className="aspect-[4/3] h-[320px] w-full"
                    config={PROGRESS_CHART_CONFIG}
                    id="dashboard-progress"
                  >
                    <BarChart data={progressData} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis axisLine={false} dataKey="bucket" tickLine={false} tickMargin={10} />
                      <YAxis axisLine={false} tickLine={false} width={28} />
                      <ChartTooltip
                        content={<ChartTooltipContent indicator="line" />}
                        cursor={false}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="onTrack" fill="var(--color-onTrack)" radius={[4, 4, 0, 0]} />
                      <Bar
                        dataKey="attention"
                        fill="var(--color-attention)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar dataKey="delayed" fill="var(--color-delayed)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          ) : null}

          {showRequiresAttention ? (
            <div className="grid gap-4 lg:grid-cols-1">
              <Card className="border-slate-200 shadow-none h-[410px]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold text-slate-950">
                        {DASHBOARD_LABELS.PORTFOLIO_PROGRESS.REQUIRES_ATTENTION_TITLE}
                      </CardTitle>
                    </div>
                    <Button asChild size="sm" variant="ghost" className="shrink-0">
                      <Link href={`/dashboard/project-requires-attention?companyId=${companyId}`}>
                        View all
                        <ArrowRight className="h-4 w-4" data-icon="inline-end" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 h-full overflow-y-auto">
                  {attentionItems.length === 0 ? (
                    <EmptyState
                      className="min-h-[320px]"
                      description={
                        DASHBOARD_LABELS.PORTFOLIO_PROGRESS.REQUIRES_ATTENTION_EMPTY_DESCRIPTION
                      }
                      title={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.REQUIRES_ATTENTION_EMPTY_TITLE}
                    />
                  ) : (
                    attentionItems.map((item) => (
                      <AttentionListItem key={item.projectId} item={item} />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}

function AttentionListItem({ item }: { item: DashboardProjectProgressAttentionItem }) {
  const meta = PROJECT_STATUS_META[item.status];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500">{item.projectCode}</p>
        <p className="truncate text-sm font-medium text-slate-950">{item.projectName}</p>
      </div>
      <div className="mt-3 grid gap-3 grid-cols-2 md:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {DASHBOARD_LABELS.COMMON.PLANNED}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-950">
            {formatPercent(item.plannedProgress)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {DASHBOARD_LABELS.COMMON.ACTUAL}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-950">
            {formatPercent(item.actualProgress)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {DASHBOARD_LABELS.COMMON.VARIANCE}
          </p>
          <p
            className={cn(
              'mt-1 text-sm font-medium',
              item.variance < 0 ? 'text-destructive' : 'text-green-700'
            )}
          >
            {formatSignedPercentage(item.variance)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {DASHBOARD_LABELS.COMMON.STATUS}
          </p>
          <Badge className={cn('mt-1', meta.chipClass)} variant={meta.badge}>
            {meta.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function getProjectStatusRank(status: DashboardProjectStatus): number {
  switch (status) {
    case 'delayed':
      return 3;
    case 'attention':
      return 2;
    case 'on_track':
      return 1;
    case 'unmeasured':
      return 0;
    default:
      return 0;
  }
}

function getVarianceTone(variance: number | null) {
  if (variance === null || variance === undefined) {
    return 'slate';
  }

  if (variance < 0) {
    return 'red';
  }

  if (variance > 0) {
    return 'green';
  }

  return 'slate';
}
