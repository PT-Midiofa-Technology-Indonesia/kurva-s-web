export interface PurchaseRequestDetailItem {
  id: string;
  code: string;
  materialName: string;
  quantity: number;
  remainingQuantity: number;
  uom: string;
  status: string;
  statusLabel: string;
  remarks: string;
}

export interface PurchaseRequestDetailRequestedBy {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface PurchaseRequestDetail {
  id: string;
  code: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  companyId: string;
  companyName: string;
  type: string;
  typeLabel: string;
  source: string;
  sourceLabel: string;
  dateRequest: string;
  dateRequired: string;
  requestedBy: PurchaseRequestDetailRequestedBy;
  status: string;
  statusLabel: string;
  notes: string | null;
  items: PurchaseRequestDetailItem[];
}
