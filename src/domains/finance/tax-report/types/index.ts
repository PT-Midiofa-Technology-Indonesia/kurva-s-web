export type TaxReportStatus =
  | 'pending'
  | 'included'
  | 'reported'
  | 'not_reported'
  | 'in_progress'
  | 'closed';
export type TaxReportDirection = 'input' | 'output' | 'withheld';

export interface TaxReportTaxType {
  id: string;
  code: string;
  name: string;
  category?: string;
}

export interface TaxReportPartner {
  type: string;
  id: string;
  code: string;
  name: string;
  address?: string | null;
  npwp?: string | null;
}

export interface TaxReportCompany {
  id: string;
  code: string;
  name: string;
}

export interface TaxReportResource {
  id: string;
  code: string;
  type: string;
  status: string;
  vendorId?: string | null;
  dueDate?: string | null;
  totalAmount?: number | null;
}

export interface TaxReportUploadedDocument {
  id: string;
  fileName: string;
  fileSize?: number | null;
  mimeType?: string | null;
  url: string;
  createdAt?: string;
}

export interface TaxReportAttachment {
  id: string;
  documentTypeId: string;
  documentTypeName: string;
  documentTypeCode: string;
  allowedFileTypes?: string | null;
  allowedMaxSize?: number | null;
  isMandatory?: boolean;
  isUploaded?: boolean;
  uploadedDocuments?: TaxReportUploadedDocument[];
}

export interface TaxReportTaxDetail {
  id: string;
  taxTypeId: string;
  taxType: { id: string; code: string; name: string; category: string };
  taxBaseAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  direction: TaxReportDirection;
}

export interface TaxReport {
  id: string;
  companyId: string;
  company?: TaxReportCompany;
  code: string;
  transactionDate: string;
  documentNumber: string | null;
  documentDate: string | null;
  status: TaxReportStatus;
  resourceType: string;
  resourceId: string;
  resourceReference: string;
  resource?: TaxReportResource;
  subtotalAmount: number;
  totalTaxAmount: number;
  totalAmount: number;
  direction: TaxReportDirection;
  notes: string | null;
  partner: TaxReportPartner;
  taxDetails?: TaxReportTaxDetail[];
  attachments?: TaxReportAttachment[];
  createdAt: string;
  updatedAt: string;
}
