# Legal Domain

Halaman publik yang wajib tersedia untuk submission aplikasi ke Google Play Store: **Kebijakan Privasi** dan **Permintaan Penghapusan Akun**.

## Konteks: aplikasi internal, bukan SaaS

Curva-S adalah **aplikasi internal Midiofa Technology Indonesia**, bukan layanan yang dijual ke perusahaan lain. Penggunanya karyawan dan pihak yang diberi wewenang; akun dibuat administrator, tidak ada pendaftaran mandiri.

Ini menentukan cara teks kebijakan ditulis: **hanya ada satu pihak, yaitu "kami"**. Jangan memisahkan "kami sebagai penyedia layanan" dari "perusahaan Anda sebagai pemilik data" — itu bahasa SaaS dan salah konteks di sini. Fitur multi-company di aplikasi merujuk pada unit usaha di dalam grup sendiri, bukan tenant pelanggan.

Isi kebijakan sudah disetujui pemilik produk. Saat mengisi form **Data Safety** di Play Console, pastikan daftar data di sana cocok dengan yang tertulis di halaman ini.

## Struktur

```
legal/
├── components/
│   └── AccountDeletionForm.tsx   # FormGenerator + FormCard
├── constants/
│   └── index.ts                  # Seluruh teks kebijakan, label form, path
├── pages/
│   ├── AccountDeletionPage.tsx   # Form + confirm dialog + state sukses
│   └── PrivacyPolicyPage.tsx     # Render section dari constants
├── schemas/
│   └── index.ts                  # deleteAccountRequestSchema (Zod)
└── index.ts                      # Barrel exports
```

Domain ini tidak punya `api/`, `hooks/`, `services/`, `store/`, atau `types/` — form penghapusan akun **belum terhubung ke backend** (lihat bagian berikutnya).

## Routes

| Route | Page | Akses |
|---|---|---|
| `/privacy-policy` | `PrivacyPolicyPage` | Publik — tanpa login |
| `/delete-account` | `AccountDeletionPage` | Publik — tanpa login |

Keduanya berada di route group `app/(public)/`, bukan `app/(protected)/`, sehingga tidak memakai `PermissionAwareDashboardLayout` dan tidak ikut ter-scan oleh coverage test di `portal-routes.test.ts`.

## Cara keduanya jadi publik

`proxy.ts` mem-blokir semua route yang tidak dikenal dari dua arah: pengunjung tanpa token dilempar ke `/login`, dan pengguna yang sudah login kena portal guard yang fail-closed. Dua daftar yang sudah ada tidak cocok untuk kebutuhan ini:

- `publicPaths` bersifat **guest-only** — pengguna yang sudah login justru dilempar ke `/dashboard`.
- `accessiblePaths` hanya melewatkan permintaan yang **sudah punya token**.

Karena itu ada daftar ketiga, `alwaysPublicPaths`, yang dicek paling atas di `proxy()` sejajar dengan bypass `/api/`. Perilakunya dikunci oleh test di `src/proxy.test.ts` (blok `proxy always-public paths`): dapat diakses tanpa token, tetap dapat diakses dari portal `company` maupun `project`, tidak me-redirect pengguna yang sudah login, dan mengabaikan cookie portal yang dimanipulasi.

**Menambah halaman publik baru cukup menambahkan path-nya ke `alwaysPublicPaths` di `proxy.ts`.**

## Form penghapusan akun belum terhubung backend

`AccountDeletionPage` menyimpan hasil submit di state lokal (`useState`) dan langsung menampilkan pesan sukses. **Tidak ada request yang dikirim ke mana pun.** Ini disengaja agar halaman bisa dipakai submission Play Store lebih dulu.

Untuk menghubungkannya nanti, ikuti [API_PATTERN](../../../.docs/patterns/API_PATTERN.md) dan [FORMS_PATTERN](../../../.docs/patterns/FORMS_PATTERN.md):

1. Tambah `api/create-account-deletion-request.ts`
2. Tambah `hooks/use-create-account-deletion-request.ts` (`useMutation`)
3. Ganti `handleConfirmSubmit` supaya memanggil mutation, lalu set sukses di `onSuccess`
4. Tambah state `serverErrors` dan teruskan ke `AccountDeletionForm` → prop `externalErrors` di `FormGenerator`

## Exports

- `PrivacyPolicyPage`, `AccountDeletionPage` — page components
- `AccountDeletionForm` — form component
- `deleteAccountRequestSchema`, `DeleteAccountRequestInput` — validasi Zod
- `LEGAL_COMPANY`, `LEGAL_PATHS`, `PRIVACY_POLICY_LABELS`, `DELETE_ACCOUNT_LABELS` — konstanta

## Catatan implementasi

- **Scroll container.** Root layout memasang `h-full overflow-hidden` di `<html>` dan `<body>`, jadi `app/(public)/layout.tsx` menyediakan `overflow-y-auto` sendiri. Tanpa itu halaman panjang terpotong di batas viewport.
- **Field mask wajib** sudah diterapkan sesuai FORMS_PATTERN: `noWhitespace` pada email, `maskPhone` + `prefix: '+62'` pada telepon.
- **Reuse** — tidak ada komponen baru di `shared/`. Halaman ini memakai `FormGenerator`, `FormCard`, `Alert`, `ConfirmDialog`, `Button`, dan `LoadingSkeleton` yang sudah ada.

## Related

- [`../../../LANDING_PAGE_GUIDE.md`](../../../LANDING_PAGE_GUIDE.md) — panduan landing page publik terpisah untuk kebutuhan Play Store
- `proxy.ts` — route guard
- `src/proxy.test.ts` — test yang mengunci akses publik kedua halaman ini
