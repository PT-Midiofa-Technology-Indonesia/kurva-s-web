export const LEGAL_COMPANY = {
  LEGAL_NAME: 'Midiofa Technology Indonesia',
  ADDRESS: 'Ruko Grand Kartini No. 30, Jl. AIS Nasution, Gresik',
  SUPPORT_EMAIL: 'midiofa@gmail.com',
  APP_NAME: 'Curva-S',
  DELETION_SLA_DAYS: 14,
} as const;

export const LEGAL_PATHS = {
  PRIVACY_POLICY: '/privacy-policy',
  DELETE_ACCOUNT: '/delete-account',
  LOGIN: '/login',
} as const;

export const PRIVACY_POLICY_LABELS = {
  PAGE_TITLE: 'Kebijakan Privasi',
  LAST_UPDATED_LABEL: 'Terakhir diperbarui',
  LAST_UPDATED: '20 Agustus 2026',
  INTRO: `${LEGAL_COMPANY.APP_NAME} adalah aplikasi internal ${LEGAL_COMPANY.LEGAL_NAME} ("kami") untuk mengelola proyek dan operasional perusahaan, diakses melalui aplikasi web dan aplikasi mobile. Kebijakan ini menjelaskan data apa yang kami kumpulkan dari pengguna aplikasi, bagaimana kami menggunakannya, dan hak Anda atas data tersebut.`,
  ACCOUNT_NOTICE_TITLE: 'Aplikasi internal, bukan layanan publik',
  ACCOUNT_NOTICE_BODY: `${LEGAL_COMPANY.APP_NAME} hanya diperuntukkan bagi karyawan dan pihak yang kami beri wewenang. Aplikasi ini tidak terbuka untuk umum dan tidak menyediakan pendaftaran mandiri: akun dibuat oleh administrator kami, dan akses berakhir ketika hubungan kerja atau kerja sama Anda dengan kami berakhir.`,
  SECTIONS: [
    {
      ID: 'pengumpulan-informasi',
      TITLE: 'Pengumpulan Informasi',
      PARAGRAPHS: [
        'Kami mengumpulkan data yang diperlukan agar operasional perusahaan dapat berjalan. Sebagian berasal dari data kepegawaian yang kami kelola saat akun dibuat, sebagian lagi dari aktivitas Anda saat menggunakan aplikasi.',
      ],
      ITEMS: [
        'Data identitas dan kontak: nama lengkap, alamat email, nomor telepon.',
        'Data kepegawaian: jabatan, departemen, unit usaha dan proyek yang Anda ikuti, grade, serta hak akses (role dan permission).',
        'Data aktivitas kerja: kehadiran, lembur, cuti, tugas proyek, pengajuan biaya, persetujuan, dan riwayat transaksi operasional lain yang Anda buat di dalam sistem.',
        'Data lokasi: koordinat lokasi saat melakukan pencatatan kehadiran melalui aplikasi mobile. Data ini hanya diambil pada saat aksi tersebut dilakukan.',
        'Berkas yang Anda unggah: dokumen, foto bukti, dan lampiran lain yang Anda kirimkan melalui aplikasi.',
        'Data teknis: alamat IP, jenis perangkat, dan catatan aktivitas sistem yang dibutuhkan untuk keamanan dan audit.',
      ],
    },
    {
      ID: 'penggunaan-informasi',
      TITLE: 'Penggunaan Informasi',
      PARAGRAPHS: [
        'Data Anda digunakan semata-mata untuk keperluan operasional internal kami. Kami tidak menggunakannya untuk iklan, profiling komersial, maupun tujuan lain di luar hubungan kerja.',
      ],
      ITEMS: [
        'Mengautentikasi Anda dan menentukan menu serta aksi yang boleh Anda akses sesuai role.',
        'Menjalankan proses operasional: absensi, penggajian, pengadaan, logistik, keuangan, dan pengelolaan proyek.',
        'Mengirim notifikasi terkait pekerjaan Anda, seperti permintaan persetujuan atau perubahan status tugas.',
        'Menjaga keamanan sistem, mendeteksi penyalahgunaan, dan menyediakan jejak audit internal.',
        'Memperbaiki dan mengembangkan aplikasi berdasarkan pola penggunaan secara agregat.',
      ],
    },
    {
      ID: 'keamanan-informasi',
      TITLE: 'Keamanan Informasi',
      PARAGRAPHS: [
        'Seluruh komunikasi antara aplikasi dan server kami dienkripsi menggunakan HTTPS/TLS. Akses ke data dibatasi melalui sistem role dan permission, sehingga setiap pengguna hanya dapat melihat data yang relevan dengan pekerjaannya.',
        'Kata sandi disimpan dalam bentuk terenkripsi satu arah dan tidak dapat dibaca oleh siapa pun, termasuk oleh kami. Sesi login dibatasi masa berlakunya dan akan berakhir secara otomatis.',
      ],
      ITEMS: [],
    },
    {
      ID: 'pembagian-informasi',
      TITLE: 'Pembagian Informasi dengan Pihak Ketiga',
      PARAGRAPHS: [
        'Data di dalam aplikasi ini kami kelola sendiri untuk keperluan internal. Kami tidak menjual data Anda dan tidak membagikannya untuk kepentingan pemasaran pihak mana pun. Pembagian ke luar hanya terjadi dalam hal berikut:',
      ],
      ITEMS: [
        'Penyedia infrastruktur yang kami gunakan untuk hosting dan penyimpanan data, terikat perjanjian kerahasiaan.',
        'Mitra kerja atau vendor, sebatas data yang memang diperlukan untuk pelaksanaan pekerjaan yang melibatkan mereka.',
        'Aparat penegak hukum atau instansi berwenang, apabila diwajibkan oleh peraturan perundang-undangan yang berlaku.',
      ],
    },
    {
      ID: 'hak-pengguna',
      TITLE: 'Hak Pengguna dan Penghapusan Data',
      PARAGRAPHS: [
        'Anda berhak mengakses, memperbaiki, dan meminta penghapusan data pribadi Anda. Permintaan perbaikan data kepegawaian umumnya paling cepat diselesaikan melalui tim HR atau administrator sistem kami.',
        'Perlu diketahui, sebagian data operasional wajib kami simpan selama masih diperlukan untuk kepentingan bisnis, audit, dan pemenuhan kewajiban hukum, sehingga tidak seluruhnya dapat dihapus atas permintaan.',
        'Untuk permintaan penghapusan akun beserta data pribadi Anda, gunakan halaman permintaan penghapusan akun yang tersedia tanpa perlu login.',
      ],
      ITEMS: [],
    },
    {
      ID: 'perubahan-kebijakan',
      TITLE: 'Perubahan Kebijakan Privasi',
      PARAGRAPHS: [
        'Kebijakan ini dapat diperbarui mengikuti perkembangan aplikasi atau perubahan ketentuan yang berlaku. Versi terbaru selalu dipublikasikan di halaman ini beserta tanggal pembaruannya. Perubahan yang bersifat material akan kami informasikan melalui aplikasi atau kanal internal perusahaan.',
      ],
      ITEMS: [],
    },
    {
      ID: 'kontak',
      TITLE: 'Hubungi Kami',
      PARAGRAPHS: [
        `Untuk pertanyaan mengenai kebijakan ini atau pengelolaan data pribadi Anda, hubungi kami di ${LEGAL_COMPANY.SUPPORT_EMAIL}. Surat dapat dikirimkan ke ${LEGAL_COMPANY.LEGAL_NAME}, ${LEGAL_COMPANY.ADDRESS}.`,
      ],
      ITEMS: [],
    },
  ],
} as const;

export const DELETE_ACCOUNT_LABELS = {
  PAGE_TITLE: 'Hapus Akun',
  INTRO: `Gunakan formulir ini untuk mengajukan penghapusan akun ${LEGAL_COMPANY.APP_NAME} beserta data pribadi Anda. Permintaan diproses paling lama ${LEGAL_COMPANY.DELETION_SLA_DAYS} hari kerja sejak diterima.`,
  WARNING_TITLE: 'Penghapusan bersifat permanen',
  WARNING_BODY:
    'Setelah permintaan diproses, akun Anda tidak dapat dipulihkan dan Anda akan kehilangan akses ke seluruh data yang terkait dengannya. Pastikan tidak ada tugas, pengajuan, atau persetujuan yang masih berjalan atas nama Anda.',
  RETENTION_TITLE: 'Data yang tetap disimpan',
  RETENTION_BODY:
    'Sebagian catatan operasional dan transaksi yang Anda buat, misalnya dokumen pengadaan, penggajian, dan persetujuan, tetap kami simpan sebagai catatan bisnis dan untuk memenuhi kewajiban hukum serta audit. Catatan tersebut dipisahkan dari identitas pribadi Anda apabila memungkinkan.',
  ALTERNATIVE_TITLE: 'Melalui administrator sistem',
  ALTERNATIVE_BODY:
    'Karena akun dibuat oleh administrator kami, penonaktifan akun juga dapat diajukan langsung kepada tim HR atau administrator sistem. Jalur tersebut umumnya lebih cepat.',
  FIELDS: {
    FULL_NAME: 'Nama Lengkap',
    EMAIL: 'Email Terdaftar',
    PHONE: 'No. WhatsApp / Telepon Terdaftar',
    REASON: 'Alasan Penghapusan',
    CONFIRMATION:
      'Saya memahami bahwa penghapusan akun bersifat permanen dan tidak dapat dibatalkan',
  },
  PLACEHOLDERS: {
    FULL_NAME: 'Masukan nama lengkap sesuai akun',
    EMAIL: 'Masukan email yang terdaftar',
    PHONE: '81234567890',
    REASON: 'Ceritakan singkat alasan Anda (opsional)',
  },
  BUTTONS: {
    SUBMIT: 'Kirim Permintaan Penghapusan',
    SUBMITTING: 'Mengirim...',
    DONE: 'Selesai',
  },
  DIALOG: {
    TITLE: 'Kirim permintaan penghapusan akun?',
    DESCRIPTION: `Permintaan akan kami tinjau dan proses paling lama ${LEGAL_COMPANY.DELETION_SLA_DAYS} hari kerja. Tindakan ini tidak dapat dibatalkan setelah diproses.`,
    CANCEL: 'Batal',
    CONFIRM: 'Ya, Kirim',
  },
  SUCCESS: {
    TITLE: 'Permintaan Anda telah diterima',
    BODY: `Kami telah menerima permintaan penghapusan akun Anda dan akan memprosesnya paling lama ${LEGAL_COMPANY.DELETION_SLA_DAYS} hari kerja. Konfirmasi akan dikirimkan ke email yang Anda cantumkan. Bila ada pertanyaan, hubungi ${LEGAL_COMPANY.SUPPORT_EMAIL}.`,
  },
} as const;
