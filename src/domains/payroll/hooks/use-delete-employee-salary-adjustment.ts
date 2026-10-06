'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { deleteEmployeeSalaryAdjustment } from '../api/delete-employee-salary-adjustment';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function useDeleteEmployeeSalaryAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, companyId }: { employeeId: string; companyId?: string | null }) =>
      deleteEmployeeSalaryAdjustment(employeeId, companyId),
    onSuccess: () => {
      toast.success({ title: 'Salary adjustment berhasil dihapus' });
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.employeeSalaryAdjustments });
      queryClient.invalidateQueries({
        queryKey: PAYROLL_QUERY_KEYS.employeeSalaryAdjustmentDetail,
      });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
