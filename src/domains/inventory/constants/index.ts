export const STOCK_MONITORING_TABS = {
  MATERIAL: 'material',
  EQUIPMENT: 'equipment',
} as const;

export type StockMonitoringTab = (typeof STOCK_MONITORING_TABS)[keyof typeof STOCK_MONITORING_TABS];

export const STOCK_MONITORING_TAB_LABELS: Record<StockMonitoringTab, string> = {
  [STOCK_MONITORING_TABS.MATERIAL]: 'Material',
  [STOCK_MONITORING_TABS.EQUIPMENT]: 'Equipment',
};

export type BadgeVariant = 'secondary' | 'warning' | 'info' | 'destructive' | 'success';

/**
 * Backend owns the stock status string (BR-SM06). Keys are normalised —
 * lowercased, non-alphanumerics collapsed to a single dash — so "Low Stock",
 * "low_stock" and "LOW STOCK" all resolve to the same badge.
 */
export const STOCK_STATUS_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  normal: 'success',
  'low-stock': 'warning',
  low: 'warning',
  overstock: 'info',
  'over-stock': 'info',
  'threshold-inconsistent': 'destructive',
};

/** Equipment unit status, likewise rendered from the backend string. */
export const EQUIPMENT_STATUS_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  available: 'success',
  allocated: 'info',
  'in-maintenance': 'warning',
  maintenance: 'warning',
  broken: 'destructive',
  retired: 'secondary',
};

export const EQUIPMENT_STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'allocated', label: 'Allocated' },
  { value: 'in_maintenance', label: 'In Maintenance' },
  { value: 'broken', label: 'Broken' },
  { value: 'retired', label: 'Retired' },
];

/** In = stock added to the warehouse, Out = stock leaving it. */
export const MOVEMENT_TYPE_OPTIONS = [
  { value: 'in', label: 'In' },
  { value: 'out', label: 'Out' },
];

export const MOVEMENT_TYPE_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  in: 'success',
  out: 'destructive',
};

export const STOCK_MONITORING_LABELS = {
  ALL_WAREHOUSES: 'Semua Warehouse',
  ALL_STATUS: 'Semua Status',
  ALL_MOVEMENT_TYPES: 'Semua Movement Type',
  COMPANY_PLACEHOLDER: 'Company',
  DELETED_ITEM: '(Deleted Item)',
  MATERIAL: {
    TITLE: 'Stock Monitoring',
    EMPTY: 'No stock material available in this warehouse.',
    COLUMNS: {
      CODE: 'Code',
      NAME: 'Material',
      WAREHOUSE: 'Warehouse Destination',
      QTY_ON_HAND: 'Qty on Hand',
      RESERVED: 'Reserved',
      AVAILABLE: 'Available',
      STATUS: 'Status',
      LAST_UPDATE: 'Last Update',
      ACTIONS: 'Action',
    },
    ACTIONS: {
      MOVEMENT_HISTORY: 'Movement History',
      SET_THRESHOLD: 'Set Threshold',
    },
  },
  EQUIPMENT: {
    TITLE: 'Stock Monitoring',
    EMPTY: 'No equipment available in this warehouse.',
    COLUMNS: {
      UNIT_CODE: 'Unit Code',
      NAME: 'Equipment',
      WAREHOUSE: 'Warehouse Destination',
      STATUS: 'Status',
      LAST_UPDATE: 'Last Update',
      ACTIONS: 'Action',
    },
    ACTIONS: {
      MOVEMENT_HISTORY: 'Movement History',
    },
  },
  THRESHOLD: {
    TITLE: 'Set Stock Threshold',
    FIELDS: {
      MIN: 'Min',
      MAX: 'Max',
    },
    PLACEHOLDERS: {
      MIN: '0',
      MAX: '0',
    },
    WARNING_INCONSISTENT:
      'Minimum threshold lebih besar dari maximum threshold. Data tetap dapat disimpan, namun item akan ditandai sebagai Threshold Inconsistent.',
    BUTTONS: {
      SAVE: 'Set Threshold',
      SAVING: 'Menyimpan...',
      CANCEL: 'Batal',
    },
  },
  MOVEMENT_HISTORY: {
    TITLE: 'Stock Movement',
    BACK: 'Kembali',
    EMPTY: 'Belum ada pergerakan stok untuk item ini.',
    COLUMNS: {
      TIMESTAMP: 'Timestamp',
      ITEM: 'Item',
      QTY: 'Qty',
      MOVEMENT_TYPE: 'Movement Type',
      WAREHOUSE: 'Warehouse Destination',
      SOURCE: 'Source',
      BALANCE_AFTER: 'Balance After',
      USER: 'User',
    },
  },
} as const;
