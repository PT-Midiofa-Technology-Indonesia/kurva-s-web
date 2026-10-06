'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getFieldErrors } from '@/lib/api-error';
import { useQueryParams } from '@/shared/hooks/use-query-params';

import type { UpdateEmployeePayload } from '../api/update-employee';
import { useEmployee } from './use-employee';
import { EMPLOYEE_QUERY_KEYS } from './use-employees';
import { useUpdateEmployee } from './use-update-employee';

const LIST_URL = '/human-resource/manpower';

export function useEditEmployeePage(employeeId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { queryParams } = useQueryParams<{ companyId?: string }>();
  const companyId = queryParams.companyId;
  const { data: employee, isLoading } = useEmployee(employeeId);
  const { mutate: updateEmployee, isPending } = useUpdateEmployee(employeeId, companyId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateEmployeePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const isUserLinked = !!employee?.userId;

  const handleCancel = () => router.push(LIST_URL);

  const handleBeforeSubmit = (payload: UpdateEmployeePayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateEmployee(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.detail(employeeId) });
        setIsDialogOpen(false);
        setPendingPayload(null);
        setServerErrors({});
        router.push(LIST_URL);
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
    employee,
    isLoading,
    isUserLinked,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    companyId,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  };
}
