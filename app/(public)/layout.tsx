import Image from 'next/image';
import Link from 'next/link';
import { LEGAL_COMPANY, LEGAL_PATHS } from '@/domains/legal';

/**
 * Shell for pages anyone can open, signed in or not.
 *
 * The root layout pins <html> and <body> to `h-full overflow-hidden`, so the
 * `overflow-y-auto` below is what makes long pages scrollable — don't drop it.
 */
export default function PublicRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href={LEGAL_PATHS.LOGIN} className="flex items-center gap-2">
            <Image src="/assets/logo.svg" alt="" width={28} height={28} aria-hidden />
            <span className="text-sm font-medium text-slate-950">{LEGAL_COMPANY.APP_NAME}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10">{children}</main>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {LEGAL_COMPANY.LEGAL_NAME}
          </p>
          <nav className="flex flex-wrap gap-4 text-xs text-slate-500">
            <Link href={LEGAL_PATHS.PRIVACY_POLICY} className="hover:text-slate-700">
              Kebijakan Privasi
            </Link>
            <Link href={LEGAL_PATHS.DELETE_ACCOUNT} className="hover:text-slate-700">
              Hapus Akun
            </Link>
            <a href={`mailto:${LEGAL_COMPANY.SUPPORT_EMAIL}`} className="hover:text-slate-700">
              {LEGAL_COMPANY.SUPPORT_EMAIL}
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
