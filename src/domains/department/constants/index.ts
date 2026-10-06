import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

export const DEPARTMENT_LABELS = {
  LIST: {
    TITLE: 'Department',
    DESCRIPTION: 'Manage departments in the system',
    EMPTY: 'Tidak ada department ditemukan',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Department',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    STATUS: COMMON_LABELS.STATUS,
    FILTERS: {
      STATUS: 'Semua Status',
    },
  },
} as const;

export const STATUS_OPTIONS = COMMON_STATUS_OPTIONS;
