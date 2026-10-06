'use client';

import { cn } from '@/utils/cn';
import { DASHBOARD_LABELS } from '../constants';
import { useDashboardProjectOverview } from '../hooks/use-dashboard-project-overview';
import { getStatusColorMeta } from '../services/status-color';
import type { DashboardOverviewKpiMetric, SCurvePeriodMode } from '../types';
import { KpiCardGridSkeleton, SectionError, SectionHeader } from './DashboardSectionUI';
import { KpiGaugeCard } from './KpiGaugeCard';

interface ProjectKpiSectionProps {
  interval: SCurvePeriodMode;
  projectId?: string;
}

export function ProjectKpiSection({ interval, projectId }: ProjectKpiSectionProps) {
  const { data, error, isPending, refetch } = useDashboardProjectOverview({
    projectId,
    interval,
  });

  return (
    <>
      <SectionHeader
        description={DASHBOARD_LABELS.KPI.DESCRIPTION}
        title={DASHBOARD_LABELS.KPI.TITLE}
      />
      {error ? (
        <SectionError
          error={error}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : isPending || !data ? (
        <KpiCardGridSkeleton />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ProjectKpiGaugeCard
              fallbackLabel={DASHBOARD_LABELS.KPI.METRIC_OVERALL}
              metric={data.kpi.overall}
            />
            <ProjectKpiGaugeCard
              fallbackLabel={DASHBOARD_LABELS.KPI.METRIC_SCHEDULE}
              fallbackSupportingLabel={DASHBOARD_LABELS.KPI.SUPPORTING_SCHEDULE}
              metric={data.kpi.schedule}
            />
            <ProjectKpiGaugeCard
              fallbackLabel={DASHBOARD_LABELS.KPI.METRIC_COST}
              fallbackSupportingLabel={DASHBOARD_LABELS.KPI.SUPPORTING_COST}
              metric={data.kpi.cost}
            />
            <ProjectKpiGaugeCard
              fallbackLabel={DASHBOARD_LABELS.KPI.METRIC_QUALITY}
              fallbackSupportingLabel={DASHBOARD_LABELS.KPI.SUPPORTING_QUALITY}
              metric={data.kpi.quality}
            />
          </div>
          {data.kpi.legend.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 bg-white px-4 py-3">
              {data.kpi.legend.map((item) => (
                <div className="flex items-center gap-2" key={`${item.label}-${item.color}`}>
                  <span
                    className={cn(
                      'h-2.5 w-2.5 shrink-0 rounded-full',
                      getStatusColorMeta(item.color).dotClass
                    )}
                  />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}

interface ProjectKpiGaugeCardProps {
  fallbackLabel: string;
  fallbackSupportingLabel?: string;
  metric: DashboardOverviewKpiMetric;
}

function ProjectKpiGaugeCard({
  fallbackLabel,
  fallbackSupportingLabel,
  metric,
}: ProjectKpiGaugeCardProps) {
  const meta = getStatusColorMeta(metric.statusColor);

  return (
    <KpiGaugeCard
      label={fallbackLabel}
      statusChartColor={meta.chartColor}
      statusDotClass={meta.dotClass}
      statusLabel={metric.status}
      supportingLabel={metric.label ?? fallbackSupportingLabel}
      value={metric.score}
    />
  );
}
