import type { GoodsReceiptFormValues } from '../schemas/goods-receipt';
import type { CreateGoodsReceiptPayload } from '../types/goods-receipt';

/**
 * `receivedAt` comes from a date-only picker (`yyyy-MM-dd`), so it's appended
 * with a fixed time-of-day directly — parsing it through `Date` first risks a
 * UTC/local off-by-one-day shift for date-only ISO strings.
 */
export function buildGoodsReceiptPayload(
  values: GoodsReceiptFormValues
): CreateGoodsReceiptPayload {
  const payload: CreateGoodsReceiptPayload = {
    delivery_order_id: values.deliveryOrderId,
    received_at: `${values.receivedAt} 00:00:00`,
    items: values.items.map((item) => {
      const mapped: CreateGoodsReceiptPayload['items'][number] = {
        delivery_order_item_id: item.deliveryOrderItemId,
        quantity_received: item.quantityReceived,
        quantity_rejected: item.quantityRejected,
      };
      if (item.notes) mapped.notes = item.notes;
      return mapped;
    }),
  };

  if (values.notes) payload.notes = values.notes;

  return payload;
}
