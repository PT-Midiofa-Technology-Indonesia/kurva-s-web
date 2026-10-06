import { useQuery } from '@tanstack/react-query';
import { getProcurementTaxTypes } from '../api/get-tax-types';

export const PROCUREMENT_TAX_TYPES_QUERY_KEY = ['procurement', 'tax-types'] as const;

export function useProcurementTaxTypes() {
  return useQuery({
    queryKey: PROCUREMENT_TAX_TYPES_QUERY_KEY,
    queryFn: getProcurementTaxTypes,
  });
}
