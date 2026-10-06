export type SourceShippingType = 'vendor' | 'warehouse';

export const SOURCE_SHIPPING_TYPE_OPTIONS: { value: SourceShippingType; label: string }[] = [
  { value: 'vendor', label: 'Vendor' },
  { value: 'warehouse', label: 'Warehouse' },
];

export const DELIVERY_ORDER_FORM_LABELS = {
  SECTIONS: {
    DO_DETAILS: 'DO Details',
    SET_SHIPPING: 'Set Shipping',
  },
  FIELDS: {
    RESI: 'No. Resi',
    SOURCE_SHIPPING_TYPE: 'Source Shipping Type',
    SOURCE_VENDOR: 'Source (Vendor)',
    SOURCE_WAREHOUSE: 'Source (Warehouse)',
    DESTINATION: 'Destination',
    COURIER: 'Courier',
    ETD: 'ETD (Estimated Departure)',
    ETA: 'ETA (Estimated Arrival)',
    SHIPPING_COST: 'Shipping Cost (IDR)',
    WEIGHT: 'Total Weight (Kg)',
    NOTES: 'Notes',
  },
  PLACEHOLDERS: {
    RESI: 'Masukkan nomor resi',
    SOURCE_SHIPPING_TYPE: 'Pilih tipe',
    SOURCE_VENDOR: 'Pilih vendor',
    SOURCE_WAREHOUSE: 'Pilih warehouse',
    DESTINATION: 'Pilih warehouse tujuan',
    COURIER: 'Masukkan nama kurir',
    DATE: 'Pilih tanggal',
    SHIPPING_COST: '0',
    WEIGHT: '0',
    NOTES: 'Masukkan catatan...',
  },
  TABLES: {
    PURCHASE_ORDER_TITLE: 'Purchase Order',
    LOADING_ORDER_TITLE: 'Loading Order',
    ITEM_TITLE: 'Item',
    PURCHASE_ORDER_EMPTY: 'Belum ada purchase order',
    LOADING_ORDER_EMPTY: 'Belum ada loading order',
    ITEM_EMPTY: 'Belum ada item',
    ITEM_READONLY_EMPTY: 'No items from selected Purchase/Loading Orders',
    SEARCH_PO_PLACEHOLDER: 'Cari PO...',
    SEARCH_LO_PLACEHOLDER: 'Cari LO...',
    SEARCH_ITEM_PLACEHOLDER: 'Cari item...',
    ADD_BUTTON: 'Tambah',
    PO_POPUP_TITLE: 'Pilih Purchase Order',
    LO_POPUP_TITLE: 'Pilih Loading Order',
    ITEM_POPUP_TITLE: 'Pilih Item Catalog',
    ITEM_TYPE_PLACEHOLDER: 'Semua Tipe',
    DISTRIBUTE_COST_ERROR:
      'Total alokasi biaya belum 100%. Silakan sesuaikan pembagian Distribute Cost hingga tepat 100%.',
  },
  BUTTONS: {
    CANCEL: 'Batal',
    SUBMIT: 'Simpan',
    SUBMITTING: 'Menyimpan...',
  },
} as const;
