export const TAX_REPORT_LABELS = {
  TABS: {
    TAX_REPORT: 'Tax Report',
    TAX_FILING: 'Tax Filling',
  },
  LIST: {
    TITLE: 'Tax Report',
    SEARCH_PLACEHOLDER: 'Pencarian',
    EMPTY: 'No tax report found.',
    FILTERS: {
      COMPANY: 'Company 01',
      SOURCE: 'All Source',
      TAX_TYPE: 'All Tax Type',
      STATUS: 'All Tax Status',
      DATE_RANGE: 'Document Date Range',
    },
    COLUMNS: {
      CODE: 'Code',
      DOCUMENT_NO: 'Document No',
      DOCUMENT_DATE: 'Document Date',
      SOURCE: 'Source',
      PARTNER: 'Partner',
      TOTAL_AMOUNT: 'Total Amount',
      TAX_STATUS: 'Tax Status',
      ACTION: 'Action',
    },
    ACTIONS: { VIEW: 'View tax report detail' },
  },
  DETAIL: {
    TITLE: 'Tax Report Detail',
    NOT_FOUND: 'Tax report not found.',
    LOAD_ERROR: 'Failed to load tax report.',
    TAX_SUMMARY: 'Tax Summary',
    TAX_BREAKDOWN: 'Tax Breakdown',
    TRANSACTION_INFORMATION: 'Transaction Information',
    PARTNER_INFORMATION: 'Partner Information',
    ATTACHMENTS: 'Attachments',
    PRINT: 'Print',
    DOWNLOAD: 'Download Tax Document',
    BACK: 'Back',
    EMPTY_BREAKDOWN: 'No tax breakdown.',
    EMPTY_ATTACHMENTS: 'No attachments.',
    DOWNLOAD_ATTACHMENT: (fileName: string) => `Download ${fileName}`,
  },
  FIELDS: {
    COMPANY: 'Company',
    CODE: 'Code',
    TAX_DIRECTION: 'Tax Direction',
    TAX_STATUS: 'Tax Status',
    TAXABLE_AMOUNT: 'Taxable Amount',
    TOTAL_TAX_AMOUNT: 'Total Tax Amount',
    TOTAL_TRANSACTION: 'Total Transaction',
    TAX_TYPE: 'Tax Type',
    TAX_CODE: 'Tax Code',
    TAX_BASE: 'Tax Base',
    TAX_RATE: 'Tax Rate',
    TAX_AMOUNT: 'Tax Amount',
    TOTAL_AMOUNT: 'Total Amount',
    DOCUMENT_NO: 'Document No',
    DOCUMENT_DATE: 'Document Date',
    TAX_REFERENCE_NO: 'Tax Reference No',
    TAX_REFERENCE_DATE: 'Tax Reference Date',
    SOURCE: 'Source',
    REFERENCE_NO: 'Reference No',
    PARTNER_TYPE: 'Partner Type',
    NAME: 'Name',
    ADDRESS: 'Address',
    NPWP: 'NPWP',
  },
} as const;

export const TAX_REPORT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'included', label: 'Included' },
  { value: 'reported', label: 'Reported' },
  { value: 'not_reported', label: 'Not Reported' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
];

export const TAX_REPORT_SOURCE_OPTIONS = [
  { value: 'purchase_order', label: 'Purchase Order' },
  { value: 'cost_request', label: 'Cost Request' },
  { value: 'billing_client', label: 'Billing Client' },
  { value: 'payroll', label: 'Payroll' },
];

export const TAX_REPORT_SOURCE_LABELS: Record<string, string> = {
  purchase_order: 'Purchase Order',
  cost_request: 'Cost Request',
  billing_client: 'Billing Client',
  payroll: 'Payroll',
};

export const TAX_REPORT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  included: 'Included',
  reported: 'Reported',
  not_reported: 'Not Reported',
  in_progress: 'In Progress',
  closed: 'Closed',
};
