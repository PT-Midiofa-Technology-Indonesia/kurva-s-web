import type { FinancialReportItem } from '../api/get-financial-report';
import type { FinancialReportCostItem } from '../api/get-financial-report-item-costs';

export type FinancialReportViewMode = 'rab' | 'cco';

export function resolveTotalPriceMaterial(
  item: FinancialReportItem,
  viewMode: FinancialReportViewMode
): number {
  return viewMode === 'rab' ? item.totalPriceMaterialRab : item.totalPriceMaterialCco;
}

export function resolveTotalPriceWork(
  item: FinancialReportItem,
  viewMode: FinancialReportViewMode
): number {
  return viewMode === 'rab' ? item.totalPriceWorkRab : item.totalPriceWorkCco;
}

export function resolveAmountBaseline(
  item: FinancialReportItem,
  viewMode: FinancialReportViewMode
): number {
  return viewMode === 'rab' ? item.totalAmountRab : item.totalAmountCco;
}

export function resolveBudgetRemaining(
  item: FinancialReportItem,
  viewMode: FinancialReportViewMode
): number {
  return viewMode === 'rab' ? item.budgetRemainingRab : item.budgetRemainingCco;
}

export function resolveIsOverbudget(
  item: FinancialReportItem,
  viewMode: FinancialReportViewMode
): boolean {
  return viewMode === 'rab' ? item.isOverbudgetRab : item.isOverbudgetCco;
}

export interface FinancialReportFooterTotals {
  amountBaseline: number;
  costUsed: number;
  budgetRemaining: number;
}

export function computeFinancialReportFooterTotals(
  items: FinancialReportItem[],
  viewMode: FinancialReportViewMode
): FinancialReportFooterTotals {
  return items.reduce<FinancialReportFooterTotals>(
    (acc, item) => ({
      amountBaseline: acc.amountBaseline + resolveAmountBaseline(item, viewMode),
      costUsed: acc.costUsed + item.totalAmountActual,
      budgetRemaining: acc.budgetRemaining + resolveBudgetRemaining(item, viewMode),
    }),
    { amountBaseline: 0, costUsed: 0, budgetRemaining: 0 }
  );
}

export interface FinancialReportCostFooterTotals {
  amountRab: number;
  costUsed: number;
  budgetRemaining: number;
}

export function computeFinancialReportCostFooterTotals(
  items: FinancialReportCostItem[]
): FinancialReportCostFooterTotals {
  return items.reduce<FinancialReportCostFooterTotals>(
    (acc, item) => ({
      amountRab: acc.amountRab + item.amountRab,
      costUsed: acc.costUsed + item.costUsed,
      budgetRemaining: acc.budgetRemaining + item.budgetRemaining,
    }),
    { amountRab: 0, costUsed: 0, budgetRemaining: 0 }
  );
}
