import type { SelectOption } from '@/shared/components/atoms';
import type { MomStatus } from '../types';

export const MOM_LABELS = {
  LIST: {
    TITLE: 'MoM',
    ADD_BUTTON: 'Tambah MoM Baru',
    SEARCH_PLACEHOLDER: 'Pencarian',
    EMPTY: 'Tidak ada data MoM.',
    FILTERS: {
      COMPANY: 'Pilih Company',
      STATUS: 'Semua Status',
    },
    COLUMNS: {
      TITLE: 'Judul Meeting',
      START_AT: 'Waktu Mulai',
      END_AT: 'Waktu Selesai',
      LOCATION: 'Lokasi',
      STATUS: 'Status',
      ACTIONS: 'Action',
    },
    ACTIONS: {
      VIEW: 'Lihat Detail',
    },
  },
} as const;

export const MOM_STATUS_LABELS: Record<MomStatus, string> = {
  published: 'Published',
  draft: 'Proses',
  cancelled: 'Dibatalkan',
};

export const MOM_STATUS_OPTIONS: SelectOption[] = [
  { value: 'published', label: MOM_STATUS_LABELS.published },
  { value: 'draft', label: MOM_STATUS_LABELS.draft },
  { value: 'cancelled', label: MOM_STATUS_LABELS.cancelled },
];

/** Sentinel key for the "General" To Do tab — tasks not tied to any specific project. */
export const GENERAL_TODO_TAB_ID = 'general';

export const CREATE_MOM_LABELS = {
  PAGE_TITLE: 'Tambah MoM Baru',
  FIELDS: {
    TITLE: 'Judul Meeting',
    TITLE_PLACEHOLDER: 'Masukkan judul meeting',
    COMPANY: 'Company',
    COMPANY_PLACEHOLDER: 'Masukkan company',
    PROJECT: 'Project',
    PROJECT_PLACEHOLDER: 'Masukkan project',
    LOCATION: 'Lokasi',
    LOCATION_PLACEHOLDER: 'Masukkan lokasi',
    PARTICIPANTS: 'Peserta',
    PARTICIPANTS_PLACEHOLDER: 'Masukkan peserta',
    START_DATE: 'Tanggal Mulai',
    START_DATE_PLACEHOLDER: 'Masukkan tanggal mulai',
    START_TIME: 'Jam Mulai',
    END_DATE: 'Tanggal Selesai',
    END_DATE_PLACEHOLDER: 'Masukkan tanggal selesai',
    END_TIME: 'Jam Selesai',
    TOPIC: 'Topik',
    TOPIC_PLACEHOLDER: 'Tulis topik disini',
    DECISION: 'Keputusan',
    DECISION_PLACEHOLDER: 'Tulis keputusan disini',
  },
  TODO: {
    LABEL: 'To Do',
    ADD_BUTTON: 'Tambah',
    GENERAL_TAB: 'General',
    EMPTY_TITLE: 'Belum ada data',
    COLUMNS: {
      CODE: 'Kode',
      TASK: 'Task',
    },
    TOOLTIPS: {
      ADD_CHILD: 'Tambah Subtask',
      ADD_SIBLING: 'Tambah Task',
    },
    CONTEXT_MENU: {
      CUT: 'Potong',
      COPY: 'Salin',
      PASTE: 'Tempel',
      INSERT_ABOVE: 'Sisipkan baris di atas',
      INSERT_BELOW: 'Sisipkan baris di bawah',
      ADD_CHILD: 'Tambahkan child',
      DELETE: 'Hapus baris',
    },
  },
  BUTTONS: {
    CANCEL: 'Batal',
    SAVE: 'Simpan',
    SAVING: 'Menyimpan...',
  },
  VALIDATION: {
    TITLE_REQUIRED: 'Judul meeting wajib diisi',
    COMPANY_REQUIRED: 'Company wajib dipilih',
    LOCATION_REQUIRED: 'Lokasi wajib diisi',
    PARTICIPANTS_REQUIRED: 'Minimal 1 peserta wajib dipilih',
    START_DATE_REQUIRED: 'Tanggal mulai wajib diisi',
    START_TIME_REQUIRED: 'Jam mulai wajib diisi',
    END_DATE_REQUIRED: 'Tanggal selesai wajib diisi',
    END_TIME_REQUIRED: 'Jam selesai wajib diisi',
    TOPIC_REQUIRED: 'Topik wajib diisi',
    DECISION_REQUIRED: 'Keputusan wajib diisi',
    TODO_REQUIRED: 'Minimal 1 to do wajib diisi',
  },
} as const;

export const DETAIL_MOM_LABELS = {
  PAGE_TITLE: 'Detail MoM',
  NOT_FOUND: 'Data MoM tidak ditemukan.',
  ACTIONS: {
    EDIT: 'Edit MoM',
    CANCEL_MOM: 'Batalkan MoM',
    PUBLISH: 'Publish MoM',
  },
  CANCEL_DIALOG: {
    TITLE: 'Batalkan MoM?',
    DESCRIPTION: 'MoM ini akan ditandai sebagai dibatalkan dan tidak dapat diedit lagi.',
    REASON_LABEL: 'Alasan Pembatalan',
    REASON_PLACEHOLDER: 'Tulis alasan pembatalan',
    CANCEL: 'Batal',
    CONFIRM: 'Ya, Batalkan',
    SUBMITTING: 'Menyimpan...',
  },
  PUBLISH_DIALOG: {
    TITLE: 'Publish MoM?',
    DESCRIPTION: 'MoM ini akan dipublish dan tidak dapat diedit lagi.',
    CANCEL: 'Batal',
    CONFIRM: 'Ya, Publish',
  },
  PROJECT_LABEL: (count: number) => `Project (${count})`,
  PARTICIPANTS_LABEL: (count: number) => `Peserta (${count})`,
} as const;

export const TODO_TREE_LABELS = {
  COLUMNS: {
    CODE: 'Kode',
    ADD_TASK_SUBTASK: 'Tambah Task/Subtask',
    TASK: 'Task',
    TYPE: 'Type',
    ASSIGNEE: 'Assignee',
  },
  TASK_TYPES: {
    WORK: 'Work Task',
    QC: 'QC Task',
  },
} as const;
