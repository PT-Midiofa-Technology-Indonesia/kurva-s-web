export type DashboardProjectStatus = 'on_track' | 'attention' | 'delayed' | 'unmeasured';

export type SummaryTone = 'slate' | 'green' | 'amber' | 'red' | 'brand' | 'sky';

export type DashboardKpiStatus = 'excellent' | 'good' | 'attention' | 'poor' | 'unmeasured';

export interface DashboardProjectSummary {
  prospectCount: number;
  prospectPotentialValue: number;
  activeProjects: number;
  activeProjectValue: number;
  attentionProjects: number;
  attentionPercentage: number | null;
  delayedProjects: number;
  delayedPercentage: number | null;
  completedYtd: number;
  completedYtdValue: number;
}

export interface DashboardProjectProgressBucket {
  bucket: string;
  onTrack: number;
  attention: number;
  delayed: number;
  total: number;
}

export interface DashboardProjectProgressAttentionItem {
  projectId: string;
  projectCode: string;
  projectName: string;
  plannedProgress: number;
  actualProgress: number;
  variance: number;
  status: DashboardProjectStatus;
}

export interface DashboardProjectProgress {
  portfolio: {
    plannedProgress: number | null;
    actualProgress: number | null;
    variance: number | null;
    status: DashboardProjectStatus;
    statusDistribution: {
      onTrack: { count: number; percentage: number | null };
      attention: { count: number; percentage: number | null };
      delayed: { count: number; percentage: number | null };
    };
    progressDistribution: DashboardProjectProgressBucket[];
  };
  requiresAttention: DashboardProjectProgressAttentionItem[];
}

export interface DashboardFinanceSummary {
  rabValue: number;
  potentialMarginValue: number;
  potentialMarginPercentage: number | null;
  currentBudgetValue: number;
  actualValue: number;
  remainingValue: number;
  budgetUtilization: number | null;
  remainingPercentage: number | null;
}

export interface DashboardFinanceRemainingProject {
  projectId: string;
  projectCode: string;
  projectName: string;
  budgetValue: number;
  actualValue: number;
  remainingValue: number;
  budgetUtilization: number | null;
}

export interface DashboardFinanceRemaining {
  projects: DashboardFinanceRemainingProject[];
}

export interface DashboardKpiSummary {
  schedulePerformance: number | null;
  scheduleStatus: DashboardKpiStatus;
  costPerformance: number | null;
  costStatus: DashboardKpiStatus;
  qualityPassRate: number | null;
  qualityStatus: DashboardKpiStatus;
  overallScore: number | null;
  overallStatus: DashboardKpiStatus;
}

export type SCurvePeriodMode = 'weekly' | 'monthly';

export type SCurveSeriesKey = 'originalPlan' | 'currentPlan' | 'actual';

export interface SCurvePoint {
  period: string;
  originalPlan: number | null;
  currentPlan: number | null;
  actual: number | null;
}

export interface DashboardSCurveSummary {
  planned: number;
  actual: number;
  variance: number;
  status: string;
  statusColor: string;
}

export interface DashboardSCurveProject {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  interval: SCurvePeriodMode;
  totalPeriods: number;
  subtitle: string;
}

export interface DashboardSCurveSeriesConfig {
  label: string;
  color: string;
}

export interface DashboardSCurveChartPoint extends SCurvePoint {
  date: string;
}

export interface DashboardSCurveTableRow {
  type: string;
  label: string;
  values: (number | null)[];
}

export interface DashboardSCurve {
  summary: DashboardSCurveSummary;
  project: DashboardSCurveProject;
  chartConfig: Record<SCurveSeriesKey, DashboardSCurveSeriesConfig>;
  chartData: DashboardSCurveChartPoint[];
  table: {
    periods: string[];
    rows: DashboardSCurveTableRow[];
  };
}

export interface DashboardOverviewProject {
  id: string;
  code: string;
  name: string;
  companyId: string;
  companyName: string;
  startDate: string;
  endDate: string;
}

export interface DashboardOverviewProgressCard {
  planned: number;
  actual: number;
  variance: number;
  status: string;
  statusColor: string;
}

export interface DashboardOverviewBudgetUtilization {
  label: string;
  amount: number;
  actualCostPercentage: number;
  remainingPercentage: number;
}

export interface DashboardOverviewCostBudget {
  finalRab: number;
  finalRabLabel: string;
  potentialMargin: number;
  potentialMarginPercentage: number;
  potentialMarginLabel: string;
  currentBudget: number;
  currentBudgetPercentage: number;
  currentBudgetLabel: string;
  actualCost: number;
  actualCostPercentage: number;
  actualCostLabel: string;
  remainingBudget: number;
  remainingBudgetPercentage: number;
  remainingBudgetLabel: string;
  budgetUtilization: DashboardOverviewBudgetUtilization;
}

export interface DashboardOverviewKpiMetric {
  score: number | null;
  status: string;
  statusColor: string;
  label?: string;
}

export interface DashboardOverviewKpiLegendItem {
  label: string;
  color: string;
}

export interface DashboardOverviewKpi {
  overall: DashboardOverviewKpiMetric;
  schedule: DashboardOverviewKpiMetric;
  cost: DashboardOverviewKpiMetric;
  quality: DashboardOverviewKpiMetric;
  legend: DashboardOverviewKpiLegendItem[];
}

export interface DashboardProjectOverview {
  project: DashboardOverviewProject;
  progressCard: DashboardOverviewProgressCard;
  sCurve: DashboardSCurve;
  costBudget: DashboardOverviewCostBudget;
  kpi: DashboardOverviewKpi;
}
