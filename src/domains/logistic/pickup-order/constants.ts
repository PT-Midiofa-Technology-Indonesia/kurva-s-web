import type { PickupOrderStatus, PickupOrderType } from './types';

export const PICKUP_ORDER_STATUS_BADGE: Record<
  PickupOrderStatus,
  'secondary' | 'warning' | 'success' | 'destructive'
> = {
  draft: 'secondary',
  assigned: 'warning',
  completed: 'success',
  cancelled: 'destructive',
};

export const PICKUP_ORDER_LABELS = {
  LIST: {
    TITLE: 'Pickup Order',
    SEARCH: 'Cari pickup order',
    EMPTY: 'Tidak ada data pickup order',
    COLUMNS: {
      CODE: 'Kode',
      TYPE: 'Type',
      WAREHOUSE: 'Warehouse',
      EMPLOYEE: 'PIC',
      DELIVERY_ORDERS: 'DO',
      SCHEDULED_DATE: 'Scheduled',
      STATUS: 'Status',
      ACTIONS: 'Aksi',
    },
    FILTERS: {
      TYPE: 'Type',
      STATUS: 'Status',
      WAREHOUSE: 'Warehouse',
      DATE_RANGE: 'Tanggal Jadwal',
    },
    BUTTONS: {
      ADD: 'Tambah Pickup Order',
      FILTER: 'Filter',
    },
  },
  FORM: {
    CREATE_TITLE: 'Tambah Pickup Order',
    TYPE: 'Type',
    WAREHOUSE: 'Warehouse',
    EMPLOYEE: 'PIC',
    PICKUP_LOCATION: 'Pickup Location',
    SCHEDULED_DATE: 'Scheduled Date',
    DELIVERY_ORDERS: 'Delivery Orders',
    NOTES: 'Notes',
    SAVE: 'Simpan',
    SAVE_CHANGES: 'Simpan Perubahan',
    CANCEL: 'Batal',
    CHANGE_EMPLOYEE: 'Ubah PIC',
  },
  DETAIL: {
    TITLE: 'Pickup Order Detail',
    FIELDS: {
      CODE: 'Kode',
      STATUS: 'Status',
      TYPE: 'Type',
      WAREHOUSE: 'Warehouse',
      EMPLOYEE: 'PIC',
      PICKUP_LOCATION: 'Pickup Location',
      SCHEDULED_DATE: 'Scheduled Date',
      COMPLETED_AT: 'Completed At',
      CANCELLED_REASON: 'Cancelled Reason',
      NOTES: 'Notes',
      DELIVERY_ORDERS: 'Delivery Orders',
      ITEMS: 'Items',
    },
    BUTTONS: {
      CHANGE_EMPLOYEE: 'Ubah PIC',
      COMPLETE: 'Complete',
      CANCEL: 'Cancel',
      CLOSE: 'Tutup',
    },
  },
  DIALOG: {
    CANCEL_TITLE: 'Batalkan Pickup Order',
    CANCEL_DESCRIPTION: 'Yakin ingin membatalkan pickup order ini?',
    COMPLETE_TITLE: 'Complete Pickup Order',
    COMPLETE_DESCRIPTION: 'Yakin ingin menandai pickup order ini sebagai completed?',
  },
} as const;

export const PICKUP_ORDER_TYPE_LABELS: Record<PickupOrderType, string> = {
  pickup: 'Pickup',
  deliver: 'Deliver',
};
