import { DASHBOARD_LABELS } from '../constants';
import type { DashboardProjectOverview, DashboardSCurveTableRow, SCurveSeriesKey } from '../types';

export const EMPTY_SCURVE_PERIOD_COUNT = 12;

const SERIES_KEYS: SCurveSeriesKey[] = ['originalPlan', 'currentPlan', 'actual'];

const EMPTY_PERIODS: string[] = Array.from(
  { length: EMPTY_SCURVE_PERIOD_COUNT },
  (_, index) => `P${index + 1}`
);

function createEmptySCurveTableRows(): DashboardSCurveTableRow[] {
  return SERIES_KEYS.map((type) => ({
    type,
    label: '',
    values: EMPTY_PERIODS.map(() => 0),
  }));
}

export function createEmptyDashboardProjectOverview(): DashboardProjectOverview {
  return {
    project: {
      id: '',
      code: '',
      name: '',
      companyId: '',
      companyName: '',
      startDate: '',
      endDate: '',
    },
    progressCard: {
      planned: 0,
      actual: 0,
      variance: 0,
      status: '-',
      statusColor: '',
    },
    sCurve: {
      summary: {
        planned: 0,
        actual: 0,
        variance: 0,
        status: '-',
        statusColor: '',
      },
      project: {
        id: '',
        code: '',
        name: '',
        startDate: '',
        endDate: '',
        interval: 'monthly',
        totalPeriods: EMPTY_SCURVE_PERIOD_COUNT,
        subtitle: '',
      },
      chartConfig: {
        originalPlan: { label: DASHBOARD_LABELS.SCURVE.SERIES_ORIGINAL_PLAN, color: '' },
        currentPlan: { label: DASHBOARD_LABELS.SCURVE.SERIES_CURRENT_PLAN, color: '' },
        actual: { label: DASHBOARD_LABELS.SCURVE.SERIES_ACTUAL, color: '' },
      },
      chartData: EMPTY_PERIODS.map((period) => ({
        date: '',
        period,
        originalPlan: 0,
        currentPlan: 0,
        actual: 0,
      })),
      table: {
        periods: EMPTY_PERIODS,
        rows: createEmptySCurveTableRows(),
      },
    },
    costBudget: {
      finalRab: 0,
      finalRabLabel: '',
      potentialMargin: 0,
      potentialMarginPercentage: 0,
      potentialMarginLabel: '',
      currentBudget: 0,
      currentBudgetPercentage: 0,
      currentBudgetLabel: '',
      actualCost: 0,
      actualCostPercentage: 0,
      actualCostLabel: '',
      remainingBudget: 0,
      remainingBudgetPercentage: 0,
      remainingBudgetLabel: '',
      budgetUtilization: {
        label: '',
        amount: 0,
        actualCostPercentage: 0,
        remainingPercentage: 0,
      },
    },
    kpi: {
      overall: { score: 0, status: '-', statusColor: '' },
      schedule: { score: 0, status: '-', statusColor: '' },
      cost: { score: 0, status: '-', statusColor: '' },
      quality: { score: 0, status: '-', statusColor: '' },
      legend: [],
    },
  };
}
