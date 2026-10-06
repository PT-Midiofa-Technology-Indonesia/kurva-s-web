import type { FinalizePoDraftPayload } from '../types/api';
import type { PoPreview } from '../types/po-finalize';

export function buildFinalizePayload(poList: PoPreview[]): FinalizePoDraftPayload {
  return {
    pos: poList.map((po) => ({
      vendor_id: po.vendorId,
      due_date: po.dueDate,
      warehouse_id: po.warehouseId ?? '',
      taxes: po.taxes.map((tax) => ({
        tax_type_id: tax.taxTypeId,
        rate: tax.rate,
      })),
      // Temporary: payment data intentionally omitted from finalize payload.
      payment_methods: [],
    })),
  };
}
