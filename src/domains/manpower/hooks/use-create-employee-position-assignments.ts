'use client';

import { useMutation } from '@tanstack/react-query';
import {
  type CreatePositionAssignmentsPayload,
  createEmployeePositionAssignments,
} from '../api/create-employee-position-assignments';

export function useCreateEmployeePositionAssignments(employeeId: string, companyId?: string) {
  return useMutation({
    mutationFn: (payload: CreatePositionAssignmentsPayload) =>
      createEmployeePositionAssignments(employeeId, payload, companyId),
  });
}
