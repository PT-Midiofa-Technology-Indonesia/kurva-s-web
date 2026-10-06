import { useMutation } from '@tanstack/react-query';
import { calculateAttendanceStatus } from '../api/calculate-attendance-status';
import type {
  CalculateAttendanceStatusPayload,
  CalculateAttendanceStatusResponseData,
} from '../types';

export function useCalculateAttendanceStatus(companyId?: string | null) {
  return useMutation<
    CalculateAttendanceStatusResponseData,
    Error,
    CalculateAttendanceStatusPayload
  >({
    mutationFn: async (payload) => {
      const response = await calculateAttendanceStatus(payload, companyId);
      return response.data;
    },
  });
}
