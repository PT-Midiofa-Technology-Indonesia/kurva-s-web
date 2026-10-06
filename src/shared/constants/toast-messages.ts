/**
 * Toast notification messages in Indonesian (Bahasa Indonesia)
 * Use template syntax: `${entityName} {action}` to avoid redundancy
 */

export const TOAST_MESSAGES = {
  // Success message templates
  SUCCESS: {
    CREATED: (entity: string) => `${entity} berhasil ditambahkan`,
    UPDATED: (entity: string) => `${entity} berhasil diperbarui`,
    DELETED: (entity: string) => `${entity} berhasil dihapus`,
    LOGGED_OUT: 'Berhasil keluar dari aplikasi',
  },
} as const;

/**
 * Entity names for toast messages (in Indonesian)
 */
export const ENTITY_NAMES = {
  PROJECT_TYPE: 'Tipe Proyek',
  JOB_ITEM_TYPE: 'Tipe Item Pekerjaan',
  COST_ITEM_TYPE: 'Tipe Item Biaya',
  PROJECT_CAPABILITY: 'Kemampuan Proyek',
  ROLE: 'Peran',
  PAYMENT_TYPE: 'Tipe Pembayaran',
  USER: 'Pengguna',
  USER_STATUS: 'Status Pengguna',
  EMPLOYEE: 'Employee',
  UOM: 'Satuan Ukuran',
  ITEM_CATEGORY: 'Kategori Item',
  ITEM_CATALOG: 'Item Catalog',
  GROUP: 'Group',
  HIERARCHY_MANAGEMENT: 'Hierarchy',
  COMPANY: 'Company',
  OFFICE: 'Office',
  DOCUMENT_TYPE: 'Tipe Dokumen',
  POSITION: 'Position',
  APPROVAL_WORKFLOW: 'Alur Persetujuan',
  BOQ_TEMPLATE: 'BOQ Template',
  ATTENDANCE: 'Attendance',
  OVERTIME: 'Overtime',
  EMPLOYEE_GRADE: 'Golongan',
  PURCHASE_REQUEST: 'Purchase Request',
  PURCHASE_PLANNING: 'Purchase Planning',
  PURCHASE_ORDER: 'Purchase Order',
} as const;
