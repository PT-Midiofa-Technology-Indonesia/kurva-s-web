import { z } from 'zod';

const requiredString = (message: string) =>
  z.preprocess((value) => value ?? '', z.string().min(1, message));

const loadingOrderItemSchema = z
  .object({
    itemType: z.enum(['material', 'equipment']),
    itemCatalogId: z.string().optional().default(''),
    resourceUnitId: z.string().optional().default(''),
    quantity: z.coerce.number().int().positive('Quantity harus lebih dari 0').default(1),
    notes: z.string().optional().default(''),
  })
  .superRefine((value, ctx) => {
    if (value.itemType === 'material' && !value.itemCatalogId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Material wajib dipilih',
        path: ['itemCatalogId'],
      });
    }

    if (value.itemType === 'equipment' && !value.resourceUnitId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Equipment wajib dipilih',
        path: ['resourceUnitId'],
      });
    }
  });

export const loadingOrderFormSchema = z
  .object({
    sourceType: z.enum(['allocation', 'manual']),
    resourceAllocationId: z.string().optional().default(''),
    sourceWarehouseId: z.string().optional().default(''),
    destinationWarehouseId: requiredString('Gudang tujuan wajib dipilih'),
    notes: z.string().optional().default(''),
    items: z.array(loadingOrderItemSchema).default([]),
  })
  .superRefine((value, ctx) => {
    if (value.sourceType === 'allocation' && !value.resourceAllocationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Resource allocation wajib dipilih',
        path: ['resourceAllocationId'],
      });
    }

    if (value.sourceType === 'manual') {
      if (!value.sourceWarehouseId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Source warehouse wajib dipilih',
          path: ['sourceWarehouseId'],
        });
      }

      if (value.items.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Minimal satu item wajib diisi',
          path: ['items'],
        });
      }
    }
  });

export type LoadingOrderFormValues = z.infer<typeof loadingOrderFormSchema>;
export type LoadingOrderFormItemValues = z.infer<typeof loadingOrderItemSchema>;
