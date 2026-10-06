export interface PurchaseOrderInvoiceTax {
  id?: string;
  taxTypeId: string;
  taxTypeCode: string;
  taxTypeName: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
  effect?: 'ADDITION' | 'DEDUCTION' | string;
}

export interface PurchaseOrderInvoiceDocumentFile {
  id: string;
  fileName: string;
  filePath: string;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: string;
}

export interface PurchaseOrderInvoiceDocumentRequirement {
  id: string;
  code: string;
  name: string;
  uploadedDocuments: PurchaseOrderInvoiceDocumentFile[];
}

export interface PurchaseOrderInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceDueDate: string;
  invoiceAmount: number;
  taxInvoiceNumber: string | null;
  taxInvoiceDate: string | null;
  taxInvoiceStatus: string | null;
  taxpayerNpwp: string | null;
  taxes: PurchaseOrderInvoiceTax[];
  documentRequirements: PurchaseOrderInvoiceDocumentRequirement[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderInvoiceFormValues {
  invoiceNumber: string;
  invoiceDate: string;
  invoiceDueDate: string;
  invoiceAmount: number;
  taxInvoiceNumber: string;
  taxInvoiceDate: string;
  taxInvoiceStatus: string;
  taxpayerNpwp: string;
  taxes: {
    taxTypeId: string;
    rate: number;
  }[];
  documents: {
    documentTypeId: string;
    files: File[];
    existingIds: string[];
  }[];
  invoiceDocuments?: File[];
  invoiceDocuments__existingIds?: string[];
  taxDocuments?: File[];
  taxDocuments__existingIds?: string[];
}
