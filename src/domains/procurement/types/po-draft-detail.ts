export interface PoDraftDetailItem {
  id: string;
  prCode: string;
  code: string;
  materialName: string;
  volPr: number;
  volPo: number;
  uom: string;
  remarks: string;
}

export interface PoDraftDetail {
  id: string;
  code: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  companyId: string;
  companyName: string;
  type: string;
  typeLabel: string;
  status: string;
  statusLabel: string;
  notes: string | null;
  createdBy: { id: string; name: string; email: string };
  createdAt: string;
  selectedPrs: { id: string; code: string; projectName: string }[];
  items: PoDraftDetailItem[];
}
