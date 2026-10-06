'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import type { UpdateEmployeeGradePayload } from '../types';
import { useEmployeeGrade } from './use-employee-grade';
import { EMPLOYEE_GRADE_QUERY_KEYS } from './use-employee-grades';
import { useUpdateEmployeeGrade } from './use-update-employee-grade';

export function useEditEmployeeGradePage(employeeGradeId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: employeeGrade, isLoading } = useEmployeeGrade(employeeGradeId);
  const { mutate: updateEmployeeGrade, isPending } = useUpdateEmployeeGrade(employeeGradeId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateEmployeeGradePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/master-data/employee-grade');

  const handleBeforeSubmit = (payload: UpdateEmployeeGradePayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateEmployeeGrade(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: EMPLOYEE_GRADE_QUERY_KEYS.all });
        queryClient.invalidateQueries({
          queryKey: EMPLOYEE_GRADE_QUERY_KEYS.detail(employeeGradeId),
        });
        queryClient.invalidateQueries({ queryKey: EMPLOYEE_GRADE_QUERY_KEYS.infinite() });
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/master-data/employee-grade');
      },
      onError: (error) => {
        const fieldErrors = getFieldErrors(error);
        if (fieldErrors) {
          setServerErrors(fieldErrors);
        }
      },
    });
  };

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
    setPendingPayload(null);
  };

  return {
    employeeGrade,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  };
}
