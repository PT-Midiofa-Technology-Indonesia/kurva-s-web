import { z } from 'zod';

export const createResourceUnitSchema = z.object({
  itemCatalogId: z.string().min(1, 'Item Catalog harus dipilih'),
  warehouseId: z.string().min(1, 'Warehouse harus dipilih'),
  status: z.string().min(1, 'Status harus dipilih'),
  acquisitionDate: z.string().min(1, 'Tanggal Perolehan harus diisi'),
  acquisitionCost: z.union([
    z.number().min(0, 'Biaya Perolehan harus 0 atau lebih'),
    z.string().min(1, 'Biaya Perolehan harus diisi'),
  ]),
  notes: z.string().optional(),
});

export const updateResourceUnitSchema = createResourceUnitSchema.partial();

export type CreateResourceUnitForm = z.infer<typeof createResourceUnitSchema>;
export type UpdateResourceUnitForm = z.infer<typeof updateResourceUnitSchema>;
