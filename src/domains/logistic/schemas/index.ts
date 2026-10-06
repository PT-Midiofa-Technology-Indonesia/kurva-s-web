import { z } from 'zod';
import { DELIVERY_ORDER_FORM_LABELS } from '../constants/form-fields';

const deliveryOrderItemSchema = z.object({
  itemType: z.string().default('material'),
  itemCatalogId: z.string(),
  resourceUnitId: z.string().optional().default(''),
  itemCode: z.string(),
  itemName: z.string(),
  uom: z.string().default(''),
  quantity: z.number(),
});

function hasValidDistributionTotal(items: { costAllocationPercentage: number }[]): boolean {
  if (items.length <= 1) return true;
  const total = items.reduce((sum, item) => sum + item.costAllocationPercentage, 0);
  return total === 100;
}

export const deliveryOrderSchema = z.object({
  sourceType: z.string().min(1, 'Tipe sumber wajib dipilih'),
  sourceShippingType: z.enum(['vendor', 'warehouse']).default('vendor'),
  sourceVendorId: z.string().nullable().optional(),
  sourceWarehouseId: z.string().nullable().optional(),
  destinationWarehouseId: z.string().min(1, 'Warehouse tujuan wajib dipilih'),
  etd: z.string().min(1, 'ETD wajib diisi'),
  eta: z.string().min(1, 'ETA wajib diisi'),
  resi: z.string().optional().default(''),
  carrier: z.string().optional().default(''),
  shippingCost: z.coerce.number().nullable().optional(),
  weight: z.coerce.number().nullable().optional(),
  notes: z.string().optional().default(''),
  purchaseOrders: z
    .array(
      z.object({
        purchaseOrderId: z.string(),
        code: z.string(),
        costAllocationPercentage: z.number().min(0).max(100),
        remainingQuantity: z.number().optional().default(0),
        notes: z.string().optional().default(''),
        items: z.array(deliveryOrderItemSchema).optional().default([]),
      })
    )
    .optional()
    .default([])
    .refine(hasValidDistributionTotal, {
      message: DELIVERY_ORDER_FORM_LABELS.TABLES.DISTRIBUTE_COST_ERROR,
    }),
  loadingOrders: z
    .array(
      z.object({
        loadingOrderId: z.string(),
        code: z.string(),
        costAllocationPercentage: z.number().min(0).max(100),
        notes: z.string().optional().default(''),
        items: z.array(deliveryOrderItemSchema).optional().default([]),
      })
    )
    .optional()
    .default([])
    .refine(hasValidDistributionTotal, {
      message: DELIVERY_ORDER_FORM_LABELS.TABLES.DISTRIBUTE_COST_ERROR,
    }),
  items: z
    .array(
      z.object({
        itemType: z.string().default('material'),
        itemCatalogId: z.string(),
        resourceUnitId: z.string().optional().default(''),
        itemCode: z.string(),
        itemName: z.string(),
        uom: z.string().default(''),
        quantity: z.number().min(1, 'Qty minimal 1'),
      })
    )
    .optional()
    .default([]),
});

export type DeliveryOrderFormValues = z.infer<typeof deliveryOrderSchema>;
