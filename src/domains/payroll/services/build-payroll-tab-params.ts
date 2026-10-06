import { DEFAULT_TAB, type PayrollTab } from '../constants';

/**
 * Every tab reads these same keys, so carrying them across a tab change lands the
 * next tab on the previous tab's page, search, or a sort column it does not have.
 * `perPage` is left alone: it is a preference, and page always returns to the first.
 */
const RESET_ON_TAB_CHANGE = ['page', 'search', 'sortBy', 'sortOrder'];

export function buildPayrollTabParams(currentSearch: string, tab: PayrollTab): string {
  const params = new URLSearchParams(currentSearch);

  for (const key of RESET_ON_TAB_CHANGE) params.delete(key);

  if (tab === DEFAULT_TAB) params.delete('tab');
  else params.set('tab', tab);

  return params.toString();
}
