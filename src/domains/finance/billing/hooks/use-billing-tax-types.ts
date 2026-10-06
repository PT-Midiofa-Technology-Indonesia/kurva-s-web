import { useQuery } from '@tanstack/react-query';
import { getBillingTaxTypes } from '../api/get-tax-types';

export const BILLING_TAX_TYPES_QUERY_KEY = ['billing', 'tax-types'] as const;

export function useBillingTaxTypes() {
  return useQuery({
    queryKey: BILLING_TAX_TYPES_QUERY_KEY,
    queryFn: getBillingTaxTypes,
  });
}
