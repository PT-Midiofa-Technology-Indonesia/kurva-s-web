import type { BadgeVariant } from '@/shared/components/ui';
import { COMMON_LABELS } from '@/shared/constants';

export const APPROVAL_REQUEST_LABELS = {
  LIST: {
    TITLE: 'Approval Request',
    EMPTY: 'Belum ada data Approval Request.',
    COLUMNS: {
      CODE: 'Code Request',
      WORKFLOW_NAME: 'Approval Request',
      WAKTU_PENGAJUAN: 'Waktu Pengajuan',
      STATUS: 'Status Pengajuan',
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    ACTIONS: {
      VIEW: 'Lihat Pengajuan',
    },
    FILTERS: {
      COMPANY: 'Pilih Company',
      STATUS: 'Semua Status',
    },
    SEARCH_PLACEHOLDER: 'Pencarian',
  },
  DETAIL: {
    PAGE_TITLE: 'Approval Request',
    NOT_FOUND: 'Data approval request tidak ditemukan.',
    SECTIONS: {
      SUBMISSION_INFO: 'Informasi Pengajuan',
      DETAIL: 'Detail Pengajuan',
      HISTORY: 'History Approval',
    },
    FIELDS: {
      PENGAJU: 'Pengaju',
      DEPARTMENT: 'Department',
      APPROVAL_REQUEST: 'Approval Request',
      WAKTU_PENGAJUAN: 'Waktu Pengajuan',
      CURRENT_STEPS: 'Current Steps',
      APPLICATION_STATUS: 'Status Pengajuan',
      COMPANY: 'Company',
      NAMA: 'Nama',
      JENIS_KELAMIN: 'Jenis Kelamin',
      TEMPAT_LAHIR: 'Tempat Lahir',
      TANGGAL_LAHIR: 'Tanggal Lahir',
      TELEPON: 'Telepon',
      EMAIL: 'Email',
      TYPE: 'Type',
      STATUS: 'Status',
      PROVINSI: 'Provinsi',
      KOTA: 'Kota',
      KECAMATAN: 'Kecamatan',
      DESA: 'Desa',
      DETAIL_ALAMAT: 'Detail Alamat',
    },
    HISTORY_COLUMNS: {
      STEPS: 'Steps',
      APPROVER: 'Approver',
      TANGGAL: 'Tanggal',
      ACTION: 'Action',
    },
    BUTTONS: {
      APPROVE: 'Approve',
      REJECT: 'Reject',
    },
  },
  REJECT_DRAWER: {
    TITLE: 'Tolak Pengajuan',
    REASON_LABEL: 'Alasan Penolakan',
    REASON_PLACEHOLDER: 'Type description here...',
    SUBMIT: 'Tolak Pengajuan',
    CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
    SUBMITTING: 'Menolak...',
  },
  APPROVE_DRAWER: {
    TITLE: 'Setujui Pengajuan',
    REASON_LABEL: 'Catatan (opsional)',
    REASON_PLACEHOLDER: 'Type description here...',
    SUBMIT: 'Setujui Pengajuan',
    CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
    SUBMITTING: 'Menyetujui...',
  },
  COST_BREAKDOWN: {
    DPP_LABEL: 'DPP (Nilai Sebelum Pajak)',
    TOTAL_LABEL: 'Total Dibayarkan ke Vendor',
  },
} as const;

export const APPROVAL_REQUEST_STATUS_LABELS: Record<string, string> = {
  in_progress: 'In Progress',
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Pending',
  cancelled: 'Cancelled',
};

export const APPROVAL_REQUEST_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  in_progress: 'warning',
  approved: 'success',
  rejected: 'destructive',
  pending: 'secondary',
  cancelled: 'secondary',
};
