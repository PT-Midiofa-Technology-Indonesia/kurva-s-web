import { COMMON_LABELS } from '@/shared/constants';

export const AUTH_LABELS = {
  LOGIN: {
    TITLE: 'Selamat Datang',
    SUBTITLE: 'Silahkan masuk ke sistem Curva-S',
    REMEMBER_ME: 'Ingat saya',
    SUBMIT: 'Masuk',
    ERROR: 'Invalid Credential',
  },
  PROFILE: {
    PAGE_TITLE: 'Akun Saya',
    PAGE_SUBTITLE: 'Informasi detail akun Anda.',
    FIELDS: {
      NAME: 'Nama',
      EMAIL: 'Email',
      PHONE: 'Nomor Telepon',
      STATUS: 'Status',
      ROLE: 'Role',
      JOINED: 'Bergabung',
    },
    STATUS: COMMON_LABELS.STATUS,
    ERROR: 'Gagal memuat data profil.',
  },
} as const;
