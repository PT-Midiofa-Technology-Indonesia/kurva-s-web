export const FINANCE_REPORT_LABELS = {
  LIST: {
    TITLE: 'Finance Report',
    SEARCH: 'Pencarian',
    SUMMARY: {
      TOTAL_CASH_IN: 'Total Cash In',
      TOTAL_CASH_OUT: 'Total Cash Out',
      NET_BALANCE: 'Net Balance',
      CASH_IN_TRANSACTION: 'cash in transaction',
      CASH_OUT_TRANSACTION: 'cash out transaction',
      BALANCE_DESCRIPTION: 'Cash in vs cash out difference',
    },
    FILTERS: {
      COMPANY: 'Company',
      SOURCE_TYPE: 'Source Type',
      DATE_RANGE: 'Date Range',
      TYPE: 'Type',
    },
  },
  DETAIL: {
    NOT_FOUND: 'Finance report tidak ditemukan.',
    FIELDS: {
      CODE: 'Code',
      SOURCE: 'Source',
      REFERENCE: 'Reference',
      AMOUNT: 'Amount (IDR)',
      TRANSACTION_DATE: 'Transaction Date',
      TYPE: 'Type',
      DESCRIPTION: 'Description',
    },
  },
} as const;

export const FINANCE_REPORT_SOURCE_OPTIONS = [
  { value: 'purchase_order', label: 'Purchase Order' },
  { value: 'cost_request', label: 'Cost Request' },
  { value: 'billing_client', label: 'Billing Client' },
  { value: 'payroll', label: 'Payroll' },
];

export const FINANCE_REPORT_TYPE_OPTIONS = [
  { value: 'cash_in', label: 'Cash In' },
  { value: 'cash_out', label: 'Cash Out' },
];

export const FINANCE_REPORT_TYPE_BADGE = {
  cash_in: { label: 'Cash In', variant: 'success' },
  cash_out: { label: 'Cash Out', variant: 'warning' },
} as const;

export const FINANCE_REPORT_SOURCE_BADGE_VARIANT = 'secondary';
