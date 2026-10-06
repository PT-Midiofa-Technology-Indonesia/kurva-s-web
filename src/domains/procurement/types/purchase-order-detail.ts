import type {
  PurchaseOrderInvoice,
  PurchaseOrderInvoiceDocumentRequirement,
} from './purchase-order-invoice';

export interface PurchaseOrderDetail {
  id: string;
  project: {
    id: string;
    code: string;
    name: string;
    cancelledAtWarning: boolean;
  };
  companyId: string;
  companyName: string;
  code: string;
  type: string;
  status: string;
  dueDate: string;
  due_date: string;
  payment_method: string | null;
  paymentMethods: unknown[];
  subtotal?: number;
  subtotalAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  totalPrice?: number;
  grandTotal?: number;
  notes: string | null;
  vendor: {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
  };
  createdBy?: {
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    isActive?: boolean;
  } | null;
  sourceDraft?: {
    id: string;
    code: string;
  } | null;
  sourceDraftCode?: string | null;
  documentRequirements?: PurchaseOrderInvoiceDocumentRequirement[];
  invoice: PurchaseOrderInvoice | null;
  items: PoDetailItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PoDetailItem {
  id: string;
  purchaseOrderId: string;
  catalog: string;
  catalogName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}
