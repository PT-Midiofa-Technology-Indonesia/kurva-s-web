import type { InformasiProjectCardLabels } from '@/domains/project-control/components/InformasiProjectCard';

export const SCHEDULE_COLUMN_LABELS = {
  code: 'Code',
  taskName: 'Task Name',
  startDate: 'Start Date',
  endDate: 'End Date',
  duration: 'Duration',
  weight: 'Bobot',
  progress: 'Progress',
} as const;

export const VIEW_MODE_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
] as const;

export const SCHEDULE_INFORMATION_CARD_LABELS: InformasiProjectCardLabels = {
  TITLE: 'Informasi Project',
  LABELS: {
    PROJECT_NAME: 'Nama Project',
    PROJECT_OWNER: 'Pemilik Project',
    CLIENT: 'Klien',
    ESTIMATED_VALUE: 'Estimasi Nilai Project',
    PROJECT_PERIOD: 'Periode Project',
    DESCRIPTION: 'Deskripsi',
  },
};

export const SCHEDULE_PAGE_LABELS = {
  PAGE_TITLE: 'Schedule',
  SEARCH_PLACEHOLDER: 'Cari task...',
  FULLSCREEN_ENTER: 'Layar penuh',
  FULLSCREEN_EXIT: 'Keluar layar penuh',
} as const;
