'use client';

import { BarChart3, Building2, Target, TrendingUp, Wallet } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
} from '@/components/ui';
import { formatCurrencyIDR } from '@/shared/utils/format';
import { cn } from '@/utils/cn';
import { DASHBOARD_LABELS } from '../constants';
import { useDashboardProjectOverview } from '../hooks/use-dashboard-project-overview';
import { formatPercent } from '../services/format';
import type { SCurvePeriodMode } from '../types';
import {
  MetricCard,
  SectionError,
  SectionHeader,
  SummaryCardGridSkeleton,
} from './DashboardSectionUI';

interface ProjectCostBudgetSectionProps {
  interval: SCurvePeriodMode;
  projectId?: string;
}

export function ProjectCostBudgetSection({ interval, projectId }: ProjectCostBudgetSectionProps) {
  const { data, error, isPending, refetch } = useDashboardProjectOverview({
    projectId,
    interval,
  });

  return (
    <>
      <SectionHeader
        description={DASHBOARD_LABELS.COST_BUDGET.DESCRIPTION}
        title={DASHBOARD_LABELS.COST_BUDGET.TITLE}
      />
      {error ? (
        <SectionError
          error={error}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : isPending || !data ? (
        <SummaryCardGridSkeleton count={5} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              detail={data.costBudget.finalRabLabel}
              icon={Building2}
              label={DASHBOARD_LABELS.COST_BUDGET.METRIC_RAB}
              tone="slate"
              value={formatCurrencyIDR(data.costBudget.finalRab)}
            />
            <MetricCard
              detail={data.costBudget.potentialMarginLabel}
              icon={TrendingUp}
              label={DASHBOARD_LABELS.COST_BUDGET.METRIC_POTENTIAL_MARGIN}
              tone="green"
              value={formatCurrencyIDR(data.costBudget.potentialMargin)}
            />
            <MetricCard
              detail={data.costBudget.currentBudgetLabel}
              icon={Wallet}
              label={DASHBOARD_LABELS.COST_BUDGET.METRIC_CURRENT_BUDGET}
              tone="brand"
              value={formatCurrencyIDR(data.costBudget.currentBudget)}
            />
            <MetricCard
              detail={data.costBudget.actualCostLabel}
              icon={BarChart3}
              label={DASHBOARD_LABELS.COST_BUDGET.METRIC_ACTUAL_COST}
              tone="amber"
              value={formatCurrencyIDR(data.costBudget.actualCost)}
            />
            <MetricCard
              detail={data.costBudget.remainingBudgetLabel}
              icon={Target}
              label={DASHBOARD_LABELS.COST_BUDGET.METRIC_REMAINING_BUDGET}
              tone={data.costBudget.remainingBudget < 0 ? 'red' : 'sky'}
              value={formatCurrencyIDR(data.costBudget.remainingBudget)}
            />
          </div>

          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-950">
                    {data.costBudget.budgetUtilization.label ||
                      DASHBOARD_LABELS.COST_BUDGET.UTILIZATION_TITLE}
                  </CardTitle>
                  <CardDescription>
                    {DASHBOARD_LABELS.COST_BUDGET.UTILIZATION_DESCRIPTION}
                  </CardDescription>
                </div>
                <Badge
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    data.costBudget.budgetUtilization.actualCostPercentage >= 80
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-green-200 bg-green-50 text-green-700'
                  )}
                  variant="outline"
                >
                  {formatPercent(data.costBudget.budgetUtilization.actualCostPercentage)}{' '}
                  {DASHBOARD_LABELS.COST_BUDGET.USED_BADGE}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress
                className="h-2 bg-slate-200"
                value={data.costBudget.budgetUtilization.actualCostPercentage}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  {formatCurrencyIDR(data.costBudget.actualCost)}{' '}
                  {DASHBOARD_LABELS.COMMON.USED_LABEL}
                </span>
                <span>
                  {formatCurrencyIDR(data.costBudget.remainingBudget)}{' '}
                  {DASHBOARD_LABELS.COMMON.REMAINING_LABEL}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
