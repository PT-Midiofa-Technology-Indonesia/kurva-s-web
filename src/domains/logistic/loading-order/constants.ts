import type { SelectOption } from '@/shared/components/atoms';
import type { LoadingOrderItemType, LoadingOrderSourceType, LoadingOrderStatus } from './types';

export const LOADING_ORDER_SOURCE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'allocation', label: 'Allocation' },
  { value: 'manual', label: 'Manual' },
];

export const LOADING_ORDER_STATUS_OPTIONS: SelectOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'prepared', label: 'Prepared' },
  { value: 'loaded', label: 'Loaded' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const LOADING_ORDER_STATUS_BADGE: Record<
  LoadingOrderStatus,
  'secondary' | 'warning' | 'success' | 'destructive'
> = {
  draft: 'secondary',
  prepared: 'warning',
  loaded: 'success',
  cancelled: 'destructive',
};

export const LOADING_ORDER_LABELS = {
  LIST: {
    TITLE: 'Loading Order',
    SEARCH: 'Cari loading order',
    EMPTY: 'Tidak ada data loading order',
    COLUMNS: {
      CODE: 'Kode LO',
      SOURCE_TYPE: 'Tipe',
      SOURCE: 'Source',
      DESTINATION: 'Destination',
      ITEMS: 'Items',
      STATUS: 'Status',
      CREATED_AT: 'Dibuat',
      ACTIONS: 'Aksi',
    },
    FILTERS: {
      SOURCE_TYPE: 'Source Type',
      STATUS: 'Status',
      WAREHOUSE: 'Warehouse',
      DATE_RANGE: 'Tanggal Dibuat',
    },
    BUTTONS: {
      ADD: 'Tambah Loading Order',
      FILTER: 'Filter',
    },
  },
  FORM: {
    CREATE_TITLE: 'Tambah Loading Order',
    EDIT_TITLE: 'Edit Loading Order',
    SOURCE_TYPE: 'Source Type',
    RESOURCE_ALLOCATION: 'Resource Allocation',
    SOURCE_WAREHOUSE: 'Source Warehouse',
    DESTINATION_WAREHOUSE: 'Destination Warehouse',
    NOTES: 'Notes',
    ITEMS: 'Items',
    ADD_ITEM: 'Tambah Item',
    ITEM_TYPE: 'Item Type',
    ITEM: 'Item',
    QUANTITY: 'Quantity',
    ITEM_NOTES: 'Notes',
    SAVE: 'Simpan',
    SAVE_CHANGES: 'Simpan Perubahan',
    CANCEL: 'Batal',
  },
  DETAIL: {
    TITLE: 'Detail Loading Order',
    FIELDS: {
      CODE: 'Kode',
      STATUS: 'Status',
      SOURCE_TYPE: 'Source Type',
      RESOURCE_ALLOCATION: 'Resource Allocation',
      SOURCE_WAREHOUSE: 'Source Warehouse',
      DESTINATION_WAREHOUSE: 'Destination Warehouse',
      PREPARED_AT: 'Prepared At',
      PREPARED_BY: 'Prepared By',
      LOADED_AT: 'Loaded At',
      LOADED_BY: 'Loaded By',
      NOTES: 'Catatan',
      ITEMS: 'Items',
    },
    ITEM_COLUMNS: {
      ITEM_TYPE: 'Item Type',
      ITEM: 'Item',
      QTY: 'Qty',
      NOTES: 'Notes',
    },
    EMPTY_ITEMS: 'Belum ada item',
    BUTTONS: {
      EDIT: 'Edit',
      PREPARE: 'Prepare',
      LOAD: 'Load',
      CANCEL: 'Cancel',
      DELETE: 'Delete',
      CLOSE: 'Kembali',
      COPY_CODE: 'Salin Kode',
    },
  },
  DIALOG: {
    DELETE_TITLE: 'Hapus Loading Order',
    DELETE_DESCRIPTION: 'Yakin ingin menghapus loading order ini?',
    CANCEL_TITLE: 'Batalkan Loading Order',
    CANCEL_DESCRIPTION: 'Yakin ingin membatalkan loading order ini?',
    PREPARE_TITLE: 'Prepare Loading Order',
    PREPARE_DESCRIPTION: 'Yakin ingin menandai loading order ini sebagai prepared?',
    LOAD_TITLE: 'Load Loading Order',
    LOAD_DESCRIPTION: 'Yakin ingin menandai loading order ini sebagai loaded?',
  },
} as const;

export const LOADING_ORDER_SOURCE_TYPE_LABELS: Record<LoadingOrderSourceType, string> = {
  allocation: 'Allocation',
  manual: 'Manual',
};

export const LOADING_ORDER_ITEM_TYPE_LABELS: Record<LoadingOrderItemType, string> = {
  material: 'Material',
  equipment: 'Equipment',
};
