'use client';

import { Activity, BarChart3, Target, TrendingUp } from 'lucide-react';
import { DASHBOARD_LABELS } from '../constants';
import { useDashboardProjectOverview } from '../hooks/use-dashboard-project-overview';
import { formatPercent, formatSignedPercentage } from '../services/format';
import { getStatusColorMeta } from '../services/status-color';
import type { SCurvePeriodMode } from '../types';
import {
  MetricCard,
  SectionError,
  SectionHeader,
  SummaryCardGridSkeleton,
} from './DashboardSectionUI';

interface ProjectProgressCardSectionProps {
  interval: SCurvePeriodMode;
  projectId?: string;
}

export function ProjectProgressCardSection({
  interval,
  projectId,
}: ProjectProgressCardSectionProps) {
  const { data, error, isPending, refetch } = useDashboardProjectOverview({
    projectId,
    interval,
  });

  return (
    <>
      <SectionHeader
        description={DASHBOARD_LABELS.PROJECT_PROGRESS.DESCRIPTION}
        title={DASHBOARD_LABELS.PROJECT_PROGRESS.TITLE}
      />
      {error ? (
        <SectionError
          error={error}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : isPending || !data ? (
        <SummaryCardGridSkeleton count={4} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            detail={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.DETAIL_PLANNED}
            icon={TrendingUp}
            label={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.METRIC_PLANNED}
            tone="brand"
            value={formatPercent(data.progressCard.planned)}
          />
          <MetricCard
            detail={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.DETAIL_ACTUAL}
            icon={Activity}
            label={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.METRIC_ACTUAL}
            tone="green"
            value={formatPercent(data.progressCard.actual)}
          />
          <MetricCard
            detail={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.DETAIL_VARIANCE}
            icon={BarChart3}
            label={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.METRIC_VARIANCE}
            tone={getVarianceTone(data.progressCard.variance)}
            value={formatSignedPercentage(data.progressCard.variance)}
          />
          <MetricCard
            icon={Target}
            label={DASHBOARD_LABELS.PORTFOLIO_PROGRESS.METRIC_STATUS}
            tone={getStatusColorMeta(data.progressCard.statusColor).tone}
            value={data.progressCard.status}
          />
        </div>
      )}
    </>
  );
}

function getVarianceTone(variance: number): 'red' | 'green' | 'slate' {
  if (variance < 0) {
    return 'red';
  }

  if (variance > 0) {
    return 'green';
  }

  return 'slate';
}
