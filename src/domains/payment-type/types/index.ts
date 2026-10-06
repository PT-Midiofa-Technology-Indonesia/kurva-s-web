export interface PaymentType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTypeListItem extends PaymentType {}

// Frontend payment method types mapped from backend codes
export type PaymentMethodCode = 'cash_transfer' | 'giro';

export interface PaymentMethodMapping {
  code: PaymentMethodCode;
  type: 'tunai' | 'transfer' | 'bilyat_giro';
  label: string;
}

export const PAYMENT_METHOD_MAPPINGS: PaymentMethodMapping[] = [
  { code: 'cash_transfer', type: 'tunai', label: 'Tunai / Transfer' },
  { code: 'giro', type: 'bilyat_giro', label: 'Giro' },
];

export function mapPaymentMethodCode(code: string): PaymentMethodMapping | undefined {
  return PAYMENT_METHOD_MAPPINGS.find((m) => m.code === code);
}
