import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

export const APPROVAL_GROUP_LABELS = {
  LIST: {
    TITLE: 'Approval Group',
    EMPTY: 'Tidak ada data approval group',
    SEARCH_PLACEHOLDER: 'Cari kode atau nama approval',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Approval Group',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    STATUS: COMMON_LABELS.STATUS,
    FILTERS: {
      STATUS: 'Semua Status',
    },
  },
} as const;

export const STATUS_OPTIONS = COMMON_STATUS_OPTIONS;
