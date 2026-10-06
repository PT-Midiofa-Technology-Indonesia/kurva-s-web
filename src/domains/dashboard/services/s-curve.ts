import { DASHBOARD_LABELS } from '../constants';
import type {
  DashboardSCurve,
  DashboardSCurveChartPoint,
  DashboardSCurveTableRow,
  SCurveSeriesKey,
} from '../types';

const ACTUAL_SERIES_KEY: SCurveSeriesKey = 'actual';

const SERIES_LABEL_FALLBACKS: Record<SCurveSeriesKey, string> = {
  originalPlan: DASHBOARD_LABELS.SCURVE.SERIES_ORIGINAL_PLAN,
  currentPlan: DASHBOARD_LABELS.SCURVE.SERIES_CURRENT_PLAN,
  actual: DASHBOARD_LABELS.SCURVE.SERIES_ACTUAL,
};

export function normalizeSCurveChartPoints(
  points: DashboardSCurveChartPoint[]
): DashboardSCurveChartPoint[] {
  return points.map((point) => ({
    ...point,
    actual: point.actual ?? 0,
  }));
}

export function ensureSCurveActualTableRow(data: DashboardSCurve): DashboardSCurveTableRow[] {
  if (data.table.rows.some((row) => row.type === ACTUAL_SERIES_KEY)) {
    return data.table.rows;
  }

  return [
    ...data.table.rows,
    {
      type: ACTUAL_SERIES_KEY,
      label: getSCurveSeriesLabel(data, ACTUAL_SERIES_KEY),
      values: data.table.periods.map(
        (period) => data.chartData.find((point) => point.period === period)?.actual ?? null
      ),
    },
  ];
}

export function getSCurveSeriesLabel(data: DashboardSCurve, seriesKey: SCurveSeriesKey): string {
  return data.chartConfig[seriesKey]?.label ?? SERIES_LABEL_FALLBACKS[seriesKey];
}
