import { z } from 'zod';

export const createResourceAllocationSchema = z.object({
  allocationType: z.string().min(1, 'Allocation Type harus dipilih'),
  warehouseId: z.string().min(1, 'Warehouse harus dipilih'),
  resourceUnitId: z.string().optional(),
  itemCatalogId: z.string().optional(),
  quantity: z.coerce.number().positive().optional(),
  allocationFromDate: z.string().min(1, 'Tanggal Mulai harus diisi'),
  allocationToDate: z.string().min(1, 'Tanggal Akhir harus diisi'),
  notes: z.string().optional(),
});

export const updateResourceAllocationSchema = createResourceAllocationSchema.partial();

export type CreateResourceAllocationForm = z.infer<typeof createResourceAllocationSchema>;
export type UpdateResourceAllocationForm = z.infer<typeof updateResourceAllocationSchema>;
