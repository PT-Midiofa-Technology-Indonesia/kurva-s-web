export function parseBoqStatusFilter(status: string | undefined): boolean | undefined {
  if (status === 'isRabComplete_true') return true;
  if (status === 'isRabComplete_false') return false;
  if (status === 'isLimitBudgetComplete_true') return true;
  if (status === 'isLimitBudgetComplete_false') return false;
  if (status === 'isCcoComplete_true') return true;
  if (status === 'isCcoComplete_false') return false;
  return undefined;
}
