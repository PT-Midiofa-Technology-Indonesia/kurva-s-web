'use client';

import { useContractTypes, useSalaryTypes, useWorkPlacements } from '@/shared/hooks/use-enums';

export function useWorkPlacementEnums() {
  const { data: workPlacements = [], isLoading: wPLoading } = useWorkPlacements();
  const { data: contractTypes = [], isLoading: cTLoading } = useContractTypes();
  const { data: salaryTypes = [], isLoading: sTLoading } = useSalaryTypes();

  return {
    workPlacements,
    contractTypes,
    salaryTypes,
    isLoading: wPLoading || cTLoading || sTLoading,
  };
}
