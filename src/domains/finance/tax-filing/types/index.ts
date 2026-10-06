export type TaxFilingStatus = 'reported' | 'not_reported' | 'in_progress' | 'closed';

export interface TaxFilingTaxType {
  id: string;
  code: string;
  name: string;
}
export interface TaxFilingCompany {
  id: string;
  code: string;
  name: string;
}
export interface TaxFilingPartner {
  id: string;
  code: string;
  name: string;
}
export interface TaxFilingUser {
  id: string;
  name: string;
  email: string;
}
export interface TaxFilingDocumentType {
  id: string;
  code: string;
  name: string;
}
export interface TaxFilingAttachment {
  id: string;
  documentType?: TaxFilingDocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  createdAt?: string;
}
export interface TaxFilingPayment {
  id: string;
  billingCode: string;
  paymentDate: string;
  paymentType: { id: string; code: string; name: string };
  amount: number;
  ntpn: string;
  paymentStatus: string;
  submittedBy: TaxFilingUser;
  notes?: string | null;
  paymentProofs?: TaxFilingAttachment[];
  createdAt: string;
  updatedAt: string;
}
export interface TaxFilingInformation {
  id: string;
  filingStatus: string;
  filingPeriod: string;
  dueDate: string;
  djpReferenceNo: string;
  bpeNumber: string;
  bpeDate: string;
  submittedBy: TaxFilingUser;
  submittedAt: string;
  notes?: string | null;
  attachments?: TaxFilingAttachment[];
}
export interface TaxFilingTransactionDetail {
  id: string;
  code: string;
  source: string;
  referenceNo: string;
  partner: TaxFilingPartner;
  taxCode: string;
  taxBase: number;
  taxRate: number;
  taxAmount: number;
  totalTaxAmount: number;
  direction: string;
}
export interface TaxFilingSummary {
  taxPayable: number;
  taxPaid: number;
  outstanding: number;
  taxPayableNote?: string | null;
}
export interface TaxFiling {
  id: string;
  code: string;
  taxPeriod: string;
  taxType: TaxFilingTaxType;
  totalTax: number;
  dueDate: string;
  status: TaxFilingStatus;
  company?: TaxFilingCompany;
  taxSummary?: TaxFilingSummary;
  taxTransactionDetails?: TaxFilingTransactionDetail[];
  payments?: TaxFilingPayment[];
  information?: TaxFilingInformation | null;
  attachments?: TaxFilingAttachment[];
  createdAt: string;
  updatedAt: string;
}
export interface TaxFilingPayload {
  billingCode?: string;
  paymentDate?: string;
  paymentMethod?: string;
  paymentTypeId?: string;
  amountPaid?: string;
  ntpn?: string;
  submittedBy?: string;
  paymentStatus?: string;
  bpeNumber?: string;
  bpeDate?: string;
  djpReferenceNo?: string;
  status?: string;
  files?: File[];
}

export interface TaxFilingDocumentUploadPayload {
  files: File[];
  onUploadProgress?: (progress: number) => void;
}
