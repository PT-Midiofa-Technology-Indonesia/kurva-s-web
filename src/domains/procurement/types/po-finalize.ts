// ── Tipe untuk Step 5 Finalize ──────────────────────────────────────────────

import type { PoCostBreakdown } from './api';

export interface PaymentMethod {
  id: string;
  /** Urutan: "Metode Pembayaran 1", dst */
  order: number;
  /** ID payment type dari API (payment-types.id) */
  paymentTypeId: string;
  /** Code dari API (cash_transfer, giro) — untuk conditional rendering */
  paymentTypeCode: string;
  /** Label untuk display */
  paymentTypeLabel: string;
  amount: number;
  notes?: string | null;
  // Bilyat Giro only (kode: giro)
  issueDate?: string | null;
  effectiveDate?: string | null;
  bankName?: string | null;
  checkNumber?: string | null;
}

export interface PoPreview {
  vendorId: string;
  vendorName: string;
  vendorAddress: string;
  /** null = belum pilih warehouse */
  warehouseId: string | null;
  warehouseName: string | null;
  warehouseAddress: string | null;
  dueDate: string;
  items: PoPreviewItem[];
  paymentMethods: PaymentMethod[];
  taxes: PoTax[];
  costBreakdown?: PoCostBreakdown | null;
}

export interface PoTax {
  taxTypeId: string;
  taxTypeName: string;
  rate: number;
  effect?: 'ADDITION' | 'DEDUCTION' | string;
  amount?: number;
}

export interface PoPreviewItem {
  id: string;
  name: string;
  volPo: number;
  uom: string;
  unitPrice: number;
  totalPrice: number;
}

export function isGiroPayment(code: string): boolean {
  return code === 'PT03';
}
