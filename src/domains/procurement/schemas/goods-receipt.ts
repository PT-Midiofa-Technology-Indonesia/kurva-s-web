import { z } from 'zod';

const goodsReceiptItemSchema = z
  .object({
    deliveryOrderItemId: z.string().min(1),
    code: z.string(),
    name: z.string(),
    doQty: z.coerce.number(),
    quantityReceived: z.coerce.number().min(0, 'Qty Received tidak boleh negatif'),
    quantityRejected: z.coerce.number().min(0, 'Qty Rejected tidak boleh negatif').default(0),
    uom: z.string(),
    notes: z.string().optional().default(''),
  })
  .superRefine((item, ctx) => {
    if (item.quantityReceived > item.doQty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['quantityReceived'],
        message: `Qty Received tidak boleh melebihi DO Qty (${item.doQty})`,
      });
    }
    if (item.quantityRejected > item.quantityReceived) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['quantityRejected'],
        message: 'Qty Rejected tidak boleh melebihi Qty Received',
      });
    }
  });

export const goodsReceiptSchema = z.object({
  deliveryOrderId: z.string().min(1, 'Delivery Order wajib dipilih'),
  // Display-only, auto-filled from the DO preview / current user — never submitted
  // (buildGoodsReceiptPayload only reads the fields it needs from this object).
  destinationWarehouseName: z.string().optional(),
  sourceType: z.string().optional(),
  purchaseOrderCode: z.string().optional(),
  receivedByLabel: z.string().optional(),
  receivedAt: z.string().min(1, 'Received At wajib diisi'),
  notes: z.string().optional().default(''),
  items: z.array(goodsReceiptItemSchema).min(1, 'Delivery Order tidak memiliki item'),
});

export type GoodsReceiptFormValues = z.infer<typeof goodsReceiptSchema>;
export type GoodsReceiptItemFormValues = z.infer<typeof goodsReceiptItemSchema>;
