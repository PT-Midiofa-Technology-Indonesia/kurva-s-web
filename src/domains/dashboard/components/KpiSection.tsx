'use client';

import { cn } from '@/utils/cn';
import { DASHBOARD_LABELS } from '../constants';
import { useDashboardKpiSummary } from '../hooks/use-dashboard-kpi-summary';
import type { DashboardKpiStatus } from '../types';
import { KpiCardGridSkeleton, SectionError, SectionHeader } from './DashboardSectionUI';
import { KpiGaugeCard } from './KpiGaugeCard';

const KPI_STATUS_META: Record<
  DashboardKpiStatus,
  {
    label: string;
    chartColor: string;
    dotClass: string;
  }
> = {
  excellent: {
    label: DASHBOARD_LABELS.KPI.STATUS.EXCELLENT,
    chartColor: 'var(--color-primary)',
    dotClass: 'bg-primary',
  },
  good: {
    label: DASHBOARD_LABELS.KPI.STATUS.GOOD,
    chartColor: 'var(--color-green-600)',
    dotClass: 'bg-green-500',
  },
  attention: {
    label: DASHBOARD_LABELS.KPI.STATUS.ATTENTION,
    chartColor: 'var(--color-amber-500)',
    dotClass: 'bg-amber-500',
  },
  poor: {
    label: DASHBOARD_LABELS.KPI.STATUS.POOR,
    chartColor: 'var(--color-destructive-600)',
    dotClass: 'bg-destructive',
  },
  unmeasured: {
    label: DASHBOARD_LABELS.KPI.STATUS.UNMEASURED,
    chartColor: 'var(--color-slate-300)',
    dotClass: 'bg-slate-400',
  },
};

export function KpiSection({ companyId }: { companyId: string }) {
  const { data, error, isPending, refetch } = useDashboardKpiSummary(companyId);

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
            <KpiGaugeCard
              label={DASHBOARD_LABELS.KPI.METRIC_OVERALL}
              statusChartColor={KPI_STATUS_META[data.overallStatus].chartColor}
              statusDotClass={KPI_STATUS_META[data.overallStatus].dotClass}
              statusLabel={KPI_STATUS_META[data.overallStatus].label}
              value={data.overallScore}
            />
            <KpiGaugeCard
              label={DASHBOARD_LABELS.KPI.METRIC_SCHEDULE}
              statusChartColor={KPI_STATUS_META[data.scheduleStatus].chartColor}
              statusDotClass={KPI_STATUS_META[data.scheduleStatus].dotClass}
              statusLabel={KPI_STATUS_META[data.scheduleStatus].label}
              supportingLabel={DASHBOARD_LABELS.KPI.SUPPORTING_SCHEDULE}
              value={data.schedulePerformance}
            />
            <KpiGaugeCard
              label={DASHBOARD_LABELS.KPI.METRIC_COST}
              statusChartColor={KPI_STATUS_META[data.costStatus].chartColor}
              statusDotClass={KPI_STATUS_META[data.costStatus].dotClass}
              statusLabel={KPI_STATUS_META[data.costStatus].label}
              supportingLabel={DASHBOARD_LABELS.KPI.SUPPORTING_COST}
              value={data.costPerformance}
            />
            <KpiGaugeCard
              label={DASHBOARD_LABELS.KPI.METRIC_QUALITY}
              statusChartColor={KPI_STATUS_META[data.qualityStatus].chartColor}
              statusDotClass={KPI_STATUS_META[data.qualityStatus].dotClass}
              statusLabel={KPI_STATUS_META[data.qualityStatus].label}
              supportingLabel={DASHBOARD_LABELS.KPI.SUPPORTING_QUALITY}
              value={data.qualityPassRate}
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 bg-white px-4 py-3">
            {[
              {
                label: DASHBOARD_LABELS.KPI.LEGEND[0],
                dotClass: KPI_STATUS_META.excellent.dotClass,
              },
              {
                label: DASHBOARD_LABELS.KPI.LEGEND[1],
                dotClass: KPI_STATUS_META.good.dotClass,
              },
              {
                label: DASHBOARD_LABELS.KPI.LEGEND[2],
                dotClass: KPI_STATUS_META.attention.dotClass,
              },
              {
                label: DASHBOARD_LABELS.KPI.LEGEND[3],
                dotClass: KPI_STATUS_META.poor.dotClass,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', item.dotClass)} />
                <span className="text-sm text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
