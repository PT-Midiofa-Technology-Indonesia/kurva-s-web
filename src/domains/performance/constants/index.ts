import { AlertTriangle, CalendarClock, type LucideIcon, Medal, Target } from 'lucide-react';

// Grade colors mapping (Tailwind classes)
export const GRADE_COLORS = {
  A: 'text-green-600',
  B: 'text-blue-600',
  C: 'text-yellow-600',
  D: 'text-orange-600',
  E: 'text-red-600',
} as const;

export const GRADE_BG_COLORS = {
  A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-lime-100 text-lime-700',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-slate-100 text-slate-700',
  E: 'bg-rose-100 text-rose-700',
} as const;

export const GRADE_THEMES = {
  A: {
    cardBg: 'bg-emerald-50/70 border-emerald-200',
    badgeBg: 'bg-emerald-600 hover:bg-emerald-600 text-white',
    pillBg: 'border-emerald-300 text-emerald-700 bg-emerald-100',
    circleBg: 'bg-emerald-600 text-white',
    titleText: 'text-emerald-950',
    subText: 'text-emerald-800',
    headerText: 'text-emerald-700',
    boxBorder: 'border-emerald-200',
    rewardPill: 'bg-emerald-100 text-emerald-800',
  },
  B: {
    cardBg: 'bg-lime-50/70 border-lime-200',
    badgeBg: 'bg-lime-600 hover:bg-lime-600 text-white',
    pillBg: 'border-lime-300 text-lime-700 bg-lime-100',
    circleBg: 'bg-lime-600 text-white',
    titleText: 'text-lime-950',
    subText: 'text-lime-800',
    headerText: 'text-lime-700',
    boxBorder: 'border-lime-200',
    rewardPill: 'bg-lime-100 text-lime-800',
  },
  C: {
    cardBg: 'bg-amber-50/70 border-amber-200',
    badgeBg: 'bg-amber-600 hover:bg-amber-600 text-white',
    pillBg: 'border-amber-300 text-amber-700 bg-amber-100',
    circleBg: 'bg-amber-600 text-white',
    titleText: 'text-amber-950',
    subText: 'text-amber-800',
    headerText: 'text-amber-700',
    boxBorder: 'border-amber-200',
    rewardPill: 'bg-amber-100 text-amber-800',
  },
  D: {
    cardBg: 'bg-slate-100/70 border-slate-300',
    badgeBg: 'bg-slate-600 hover:bg-slate-600 text-white',
    pillBg: 'border-slate-300 text-slate-700 bg-slate-200',
    circleBg: 'bg-slate-600 text-white',
    titleText: 'text-slate-950',
    subText: 'text-slate-800',
    headerText: 'text-slate-700',
    boxBorder: 'border-slate-300',
    rewardPill: 'bg-slate-200 text-slate-800',
  },
  E: {
    cardBg: 'bg-rose-50/70 border-rose-200',
    badgeBg: 'bg-rose-600 hover:bg-rose-600 text-white',
    pillBg: 'border-rose-300 text-rose-700 bg-rose-100',
    circleBg: 'bg-rose-600 text-white',
    titleText: 'text-rose-950',
    subText: 'text-rose-800',
    headerText: 'text-rose-700',
    boxBorder: 'border-rose-200',
    rewardPill: 'bg-rose-100 text-rose-800',
  },
} as const;

// Performance pillar codes
export const PILAR_CODES = {
  ATTENDANCE: 'attendance',
  PRODUCTIVITY: 'productivity',
  VIOLATION: 'violation',
  WORK_QUALITY: 'work_quality',
} as const;

// Pillar icon mapping
export const PILAR_ICONS: Record<string, LucideIcon> = {
  [PILAR_CODES.ATTENDANCE]: CalendarClock,
  [PILAR_CODES.PRODUCTIVITY]: Target,
  [PILAR_CODES.VIOLATION]: AlertTriangle,
  [PILAR_CODES.WORK_QUALITY]: Medal,
} as const;

// Default pillar names fallback
export const PILAR_NAMES = {
  [PILAR_CODES.ATTENDANCE]: 'Kehadiran',
  [PILAR_CODES.PRODUCTIVITY]: 'Produktivitas',
  [PILAR_CODES.VIOLATION]: 'Pelanggaran',
  [PILAR_CODES.WORK_QUALITY]: 'Kualitas Kerja',
} as const;

// Performance labels
export const PERFORMANCE_LABELS = {
  LIST: {
    TITLE: 'KPI Karyawan',
    DESCRIPTION: 'Monitor dan evaluasi performa karyawan',
    SEARCH_PLACEHOLDER: 'Cari karyawan...',
    EMPTY: 'Tidak ada data performa ditemukan',
    COLUMNS: {
      EMPLOYEE: 'Karyawan',
      NAME: 'Nama',
      NIK: 'NIK',
      POSITION: 'Jabatan',
      DEPARTMENT: 'Departemen',
      PERIOD: 'Periode',
      PRODUCTIVITY: 'Produktivitas',
      ATTENDANCE: 'Kehadiran',
      QUALITY: 'Kualitas',
      VIOLATION: 'Pelanggaran',
      SCORE: 'Skor',
      FINAL_SCORE: 'Skor Akhir',
      GRADE: 'Grade',
      ACTION: 'Action',
      ACTIONS: 'Aksi',
    },
    ACTIONS: {
      VIEW_DETAIL: 'Lihat Detail',
    },
    FILTERS: {
      MONTH: 'Bulan',
      YEAR: 'Tahun',
      COMPANY: 'Company',
      ALL_GRADES: 'Semua Grade',
      SELECT_PERIOD: 'Pilih periode',
      SELECT_YEAR: 'Pilih tahun',
    },
    CARDS: {
      KPI_GRADE: 'KPI Grade',
    },
  },
  DETAIL: {
    TITLE: 'Detail Performa Karyawan',
    DETAIL_KPI: 'Detail KPI Karyawan',
    TABS: {
      OVERVIEW: 'Ringkasan',
      PILLARS: 'Pilar Performa',
      REWARDS: 'Reward',
      PUNISHMENTS: 'Punishment',
      HISTORY: 'HISTORY PENILAIAN',
      HISTORY_VIOLATIONS: 'HISTORY PELANGGARAN',
      PROJECTS: 'HISTORY PROJECT',
    },
    OVERVIEW: {
      PERIOD: 'Periode',
      SCORE: 'Skor Total',
      GRADE: 'Grade',
      SUMMARY: 'Ringkasan Performa',
    },
    PILLARS: {
      TITLE: 'Breakdown Pilar',
      COMPONENTS: 'Komponen',
      VALUE: 'Nilai',
      MAX_VALUE: 'Maksimal',
      PERCENTAGE: 'Persentase',
      PRODUCTIVITY: 'Produktivitas',
      ATTENDANCE: 'Kehadiran',
      QUALITY: 'Kualitas Kerja',
      WORK_QUALITY: 'Kualitas Kerja',
      VIOLATION: 'Pelanggaran',
      TOTAL_ASSESSMENT: 'Total Penilaian',
    },
    REWARDS: {
      TITLE: 'Daftar Reward',
      EMPTY: 'Belum ada reward',
      NO_REWARD: 'Tidak ada reward',
      DATE: 'Tanggal',
      DESCRIPTION: 'Keterangan',
      VALUE: 'Nilai',
      LABEL: 'Reward',
    },
    PUNISHMENTS: {
      TITLE: 'Daftar Punishment',
      EMPTY: 'Belum ada punishment',
      NO_PUNISHMENT: 'Tidak ada — performa memenuhi standar tertinggi',
      DATE: 'Tanggal',
      DESCRIPTION: 'Keterangan',
      VALUE: 'Nilai',
      LABEL: 'Punishment',
    },
    HISTORY: {
      TITLE: 'Riwayat Performa',
      EMPTY: 'Belum ada riwayat',
      PERIOD: 'Periode',
      SCORE: 'Skor',
      FINAL_SCORE: 'Hasil Akhir',
      GRADE: 'Grade',
      DATE: 'Tanggal',
      ACTION: 'Aksi',
      PRODUCTIVITY: 'Produktivitas',
      ATTENDANCE: 'Kehadiran',
      QUALITY: 'Kualitas',
    },
    PROJECTS: {
      TITLE: 'Riwayat Proyek',
      EMPTY: 'Belum ada proyek',
      PROJECT_CODE: 'Kode Proyek',
      PROJECT_NAME: 'Nama Proyek',
      ROLE: 'Peran',
      START_DATE: 'Mulai',
      END_DATE: 'Selesai',
      PERIOD: 'Periode',
      WORKER: 'Worker',
      WORKER_COUNT: 'Pekerja',
      STATUS: 'Status',
      PERFORMANCE: 'Performa',
      SCORE: 'Skor',
    },
    VIOLATIONS: {
      DATE: 'Tanggal',
      VIOLATION_TYPE: 'Jenis Pelanggaran',
      PENALTY: 'Sanksi',
    },
    BUTTONS: {
      CLOSE: 'Tutup',
    },
    CARDS: {
      FINAL_RESULT: 'Hasil akhir',
      TEMPORARY: 'Sementara',
      TOTAL_SCORE: 'Total skor',
      SCORE_RANGE: 'masuk rentang',
    },
    SEARCH: {
      PLACEHOLDER: 'Pencarian',
    },
    MODAL: {
      DETAIL_TITLE: 'Detail',
      COMPONENT_SCORE: 'skor komponen',
      COMPONENT_WEIGHT: 'bobot',
      FROM_PILLAR: 'dari pilar ini',
      JOBS_COMPLAINED: 'pekerjaan dikomplain',
      RANGE: 'masuk rentang',
    },
  },
  SUMMARY: {
    TOTAL_EMPLOYEES: 'Total Karyawan',
    AVERAGE_SCORE: 'Rata-rata Skor',
    GRADE_DISTRIBUTION: 'Distribusi Grade',
  },
  SETTINGS: {
    TITLE: 'Setting KPI',
    COMPANY_BANNER:
      'Pengaturan ini berlaku untuk company yang dipilih. Semua bobot, threshold, reward, punishment, dan komponen KPI akan diterapkan pada company tersebut.',
    TABS: {
      WEIGHTS: 'SETTING BOBOT PILAR & GRADE',
      REWARDS: 'SETTING REWARD, PUNISHMENT DAN KOMPONEN',
    },
    WEIGHTS_SECTION: 'Bobot pilar utama',
    THRESHOLDS_SECTION: 'Batas Nilai & Predikat (Grade)',
    SAVE_BUTTON: 'Simpan Pengaturan',
    GRADE_DETAIL_TITLE: 'Setting',
    REWARD_PUNISHMENT_TITLE: 'Reward & punishment per grade',
    COLUMNS: {
      GRADE: 'Grade',
      REWARD: 'Reward',
      PUNISHMENT: 'Punishment',
      COMPONENT: 'Komponen',
      WEIGHT: 'Bobot',
      SCORE: 'Skor',
      GOLONGAN: 'Golongan',
      NAMA_GOLONGAN: 'Nama Golongan',
      KPI_COMPONENT: 'Komponen KPI',
      STATUS: 'Status',
      ACTION: 'Action',
      MIN_SCORE: 'Min. skor',
      MAX_SCORE: 'Max. skor',
    },
    PICKER: {
      SELECT_REWARD: 'Pilih Reward',
      SELECT_PUNISHMENT: 'Pilih Punishment',
      SELECT_COMPONENT: 'Pilih komponen',
      SELECTED_COUNT: 'Dipilih',
      TOTAL_WEIGHT_WARNING: 'Total bobot pilar',
      CURRENT_WEIGHT: 'saat ini',
      ADJUST_TO_100: 'sesuaikan bobot komponen untuk mencapai 100%',
      MUST_BE_100: 'harus 100%',
    },
    STATUS: {
      CONFIGURED: 'Sudah di atur',
      NOT_CONFIGURED: 'Belum Diatur',
    },
    LABELS: {
      COMPONENTS_COUNT: 'komponen',
      GRADES_FILLED: 'grade diisi',
      TOTAL: 'Total',
      NO_COMPONENTS: 'Belum ada komponen diatur',
    },
    BUTTONS: {
      CANCEL: 'Cancel',
      SAVE: 'Save',
    },
  },
  CHART: {
    PERCENTAGE: 'Persentase',
    EMPLOYEES: 'karyawan',
  },
  CARD: {
    TOTAL_SCORE: 'Total Score',
  },
} as const;

// Project status mapping
export const PROJECT_STATUS_LABELS = {
  active: 'Aktif',
  completed: 'Selesai',
  'on-hold': 'Ditunda',
} as const;

export const PROJECT_STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  'on-hold': 'bg-yellow-100 text-yellow-700',
} as const;

// Action type labels
export const ACTION_TYPE_LABELS = {
  reward: 'Reward',
  punishment: 'Punishment',
} as const;

export const ACTION_TYPE_COLORS = {
  reward: 'text-green-600',
  punishment: 'text-red-600',
} as const;
