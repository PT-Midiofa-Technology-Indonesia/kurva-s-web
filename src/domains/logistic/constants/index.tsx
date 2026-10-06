import { ArrowDownToLine, ArrowUpFromLine, Truck } from 'lucide-react';
import type { DeliveryOrderType } from '../types';

// === Source Type options ===
export const DO_SOURCE_TYPE_OPTIONS = [
  { value: 'purchase_order', label: 'Purchase Order (PO)' },
  { value: 'transfer_warehouse', label: 'Manual Transfer' },
  { value: 'other_source', label: 'Other' },
];

// === sourceType display label ===
export const SOURCE_TYPE_LABELS: Record<string, string> = {
  purchase_order: 'Purchase Order (PO)',
  transfer_warehouse: 'Manual Transfer',
  other_source: 'Other',
};

// === Status badge variant ===
export const STATUS_BADGE_VARIANT: Record<
  string,
  'warning' | 'secondary' | 'success' | 'default' | 'destructive'
> = {
  requested: 'warning',
  in_transit: 'secondary',
  received: 'success',
  cancelled: 'destructive',
};

// === Page config per type ===
export interface LogisticPageConfig {
  type: DeliveryOrderType;
  title: string;
  icon: React.ReactNode;
  showSource: boolean;
  showDestination: boolean;
}

export const LOGISTIC_PAGE_CONFIGS: Record<DeliveryOrderType, LogisticPageConfig> = {
  do: {
    type: 'do',
    title: 'Delivery Order',
    icon: <Truck className="w-4 h-4" />,
    showSource: true,
    showDestination: true,
  },
  inbound: {
    type: 'inbound',
    title: 'Inbound',
    icon: <ArrowDownToLine className="w-4 h-4" />,
    showSource: true,
    showDestination: false,
  },
  outbond: {
    type: 'outbond',
    title: 'Outbound',
    icon: <ArrowUpFromLine className="w-4 h-4" />,
    showSource: false,
    showDestination: true,
  },
};

// === Labels ===
export const LOGISTIC_LABELS = {
  DETAIL: {
    BUTTONS: {
      CANCEL: 'Cancel',
    },
    DIALOG: {
      CANCEL_TITLE: 'Batalkan delivery order',
      CANCEL_DESCRIPTION: 'Yakin ingin membatalkan delivery order ini?',
      CANCEL_CONFIRM: 'Ya, Batalkan',
      CANCEL_CANCEL: 'Batal',
    },
    DOCUMENTS_TITLE: 'Bukti',
    DOCUMENTS_EMPTY: 'Belum ada file bukti.',
    DOWNLOAD_DOCUMENT: (fileName: string) => `Download ${fileName}`,
  },
  LIST: {
    COLUMNS: {
      CODE: 'NO. DO',
      TYPE: 'Type',
      SOURCE: 'Source',
      DESTINATION: 'Destination',
      ETD: 'ETD',
      ETA: 'ETA',
      STATUS: 'Status',
    },
    FILTERS: {
      STATUS: 'Status',
      SOURCE_TYPE: 'Type',
      DESTINATION_WAREHOUSE: 'Destination Warehouse',
    },
    BUTTONS: {
      ADD_DO: 'Tambah DO',
    },
    EMPTY: 'Tidak ada data delivery order',
    ACTIONS: 'Aksi',
    ACTION_VIEW: 'Lihat Detail',
    ACTION_EDIT: 'Edit',
  },
  PICKUP_ORDER: {
    COLUMNS: {
      CODE: 'Kode',
      TYPE: 'Type',
      WAREHOUSE: 'Warehouse',
      PIC: 'PIC',
      DO: 'DO',
      SCHEDULED: 'Scheduled',
      STATUS: 'Status',
      CREATED_AT: 'Dibuat',
      ACTIONS: 'Aksi',
    },
  },
  LOADING_ORDER: {
    COLUMNS: {
      CODE: 'Kode LO',
      SOURCE_TYPE: 'Source Type',
      SOURCE: 'Source',
      DESTINATION: 'Destination',
      ITEMS: 'Items',
      STATUS: 'Status',
      CREATED_AT: 'Dibuat',
      ACTIONS: 'Aksi',
    },
  },
} as const;
