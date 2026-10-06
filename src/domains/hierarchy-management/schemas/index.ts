import { z } from 'zod';
import {
  isActiveSchema,
  parentIdOptionalSchema,
  requiredSelectSchema,
} from '@/shared/schemas/common';

export const hierarchyManagementSchema = z.object({
  departmentId: requiredSelectSchema('Department wajib diisi'),
  positionId: requiredSelectSchema('Job Position wajib diisi'),
  parentId: parentIdOptionalSchema,
  isActive: isActiveSchema,
});

export const createHierarchyManagementSchema = hierarchyManagementSchema;
export const editHierarchyManagementSchema = hierarchyManagementSchema;
