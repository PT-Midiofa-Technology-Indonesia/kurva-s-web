export interface PurchaseRequestCostRow {
  id: string;
  code: string;
  name: string;
  volumeRab: number;
  cco: number;
  volumeAct: number;
  existingPr: number;
  remainingQty: number;
  max: number;
  vol: number;
  uom: string;
  remarks: string;
  disabled?: boolean;
  disabledReason?: string;
}

export interface PurchaseRequestCostSection {
  type: string;
  label: string;
  rows: PurchaseRequestCostRow[];
}

export interface PurchaseRequestCostRowsData {
  sections: PurchaseRequestCostSection[];
}
