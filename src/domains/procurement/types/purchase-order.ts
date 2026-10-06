export interface PoProject {
  id: string;
  code: string;
  name: string;
  cancelledAtWarning: boolean;
}

export interface PoVendor {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface PoWarehouse {
  id: string;
  name: string;
}

export interface PoCreatedBy {
  id: string;
  name: string;
  email: string;
}

export interface PoSourceDraft {
  id: string;
  code: string;
}

export interface PurchaseOrderItemItem {
  id: string;
  catalog: string;
  catalogName: string;
  purchaseRequestItem: {
    id: string;
    purchaseRequestId: string;
    purchaseRequestCode: string;
    boqItem: Record<string, unknown>;
    boqItemCost: Record<string, unknown>;
    costCategory: string;
    catalogType: string;
    catalogId: string;
    catalogName: string;
    quantity: number;
    remainingQuantity: number;
    uom: {
      id: string;
      group: string;
      code: string;
      name: string;
      description: string | null;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    status: string;
    approvalRequestId: string | null;
    remarks: string | null;
    createdAt: string;
    updatedAt: string;
  };
  quantity: number;
  unitPrice: number;
  amount: number;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  project: PoProject;
  companyId: string;
  companyName: string;
  code: string;
  type: string;
  vendor: PoVendor;
  status: string;
  due_date: string;
  warehouse: PoWarehouse;
  payment_method: string;
  totalAmount: number;
  notes: string | null;
  createdBy: PoCreatedBy;
  sourceDraft: PoSourceDraft;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItemItem[];
}
