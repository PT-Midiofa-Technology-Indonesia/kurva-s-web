import { COMMON_LABELS } from '@/shared/constants';

export const RESOURCE_ALLOCATION_LABELS = {
  LIST: {
    TITLE: 'Resource Allocation',
    DESCRIPTION: 'Manage resource allocations for projects',
    ADD_BUTTON: 'Allocate Resource',
    EMPTY: 'Tidak ada resource allocation ditemukan',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      PROJECT: 'Project',
      RESOURCE: 'Resource',
      TYPE: 'Allocation Type',
      ALLOCATION_DATE: 'Allocation Date',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
    FILTERS: {
      STATUS: 'Semua Status',
    },
  },
  DETAIL: {
    PAGE_TITLE: 'Allocation Detail',
    FIELDS: {
      CODE: 'Code',
      PROJECT: 'Project',
      COMPANY: 'Company',
      TYPE: 'Allocation Type',
      RESOURCE_UNIT: 'Resource Unit',
      ITEM_CATALOG: 'Item Catalog',
      WAREHOUSE: 'Warehouse',
      QUANTITY: 'Quantity',
      ALLOCATION_FROM_DATE: 'Allocation From Date',
      ALLOCATION_TO_DATE: 'Allocation To Date',
      STATUS: 'Status',
      NOTES: 'Notes',
      ALLOCATED_BY: 'Allocated By',
      RETURNED_AT: 'Returned At',
      RETURNED_BY: 'Returned By',
    },
    BUTTONS: {
      EDIT: 'Edit',
      CLOSE: 'Close',
    },
  },
} as const;

export const RESOURCE_ALLOCATION_STATUS_OPTIONS = [
  { label: 'Allocated', value: 'allocated' },
  { label: 'Returned', value: 'returned' },
];

export const RESOURCE_ALLOCATION_TYPE_OPTIONS = [
  { label: 'Unit', value: 'unit' },
  { label: 'Quantity', value: 'quantity' },
];
