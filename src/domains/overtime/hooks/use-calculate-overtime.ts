'use client';

import { useMutation } from '@tanstack/react-query';
import type { CalculateOvertimeParams } from '../api/calculate-overtime';
import { calculateOvertime } from '../api/calculate-overtime';

export function useCalculateOvertime() {
  return useMutation({
    mutationFn: (params: CalculateOvertimeParams) => calculateOvertime(params),
  });
}
