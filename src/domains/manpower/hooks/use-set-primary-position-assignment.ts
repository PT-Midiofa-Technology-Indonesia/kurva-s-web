'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setPrimaryPositionAssignment } from '../api/set-primary-position-assignment';
import { EMPLOYEE_POSITION_ASSIGNMENT_QUERY_KEYS } from './use-employee-position-assignments';

export function useSetPrimaryPositionAssignment(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (positionAssignmentId: string) =>
      setPrimaryPositionAssignment(employeeId, positionAssignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EMPLOYEE_POSITION_ASSIGNMENT_QUERY_KEYS.byEmployee(employeeId),
      });
    },
  });
}
