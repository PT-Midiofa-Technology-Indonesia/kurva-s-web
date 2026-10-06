'use client';

import { Building2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AsyncSelect } from '@/shared/components/atoms';

export interface CompanyOption {
  value: string;
  label: string;
}

export interface CompanyInfoBannerProps {
  /** Pesan utama yang ditampilkan pada banner info */
  message?: ReactNode;
  /** Custom Icon pengganti default Building2 */
  icon?: ReactNode;
  /** ID Company yang terpilih saat ini */
  companyId?: string | null;
  /** Daftar opsi company untuk AsyncSelect */
  companyOptions?: CompanyOption[];
  /** Handler saat opsi company berubah */
  onCompanyChange?: (value: string | null) => void;
  /** Placeholder untuk dropdown company */
  placeholder?: string;
  /** Custom action/control slot (misal: custom select atau custom button) untuk menggantikan AsyncSelect default */
  renderControl?: ReactNode;
  /** Additional container styling */
  className?: string;
}

export function CompanyInfoBanner({
  message = 'Pengaturan ini berlaku untuk company yang dipilih. Semua bobot, threshold, reward, punishment, dan komponen KPI akan diterapkan pada company tersebut.',
  icon = <Building2 className="h-5 w-5" />,
  companyId,
  companyOptions = [],
  onCompanyChange,
  placeholder = 'Company 01',
  renderControl,
  className,
}: CompanyInfoBannerProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-amber-100 p-2 text-amber-700">{icon}</div>
        <p className="text-sm font-medium text-amber-900">{message}</p>
      </div>

      <div className="w-full sm:w-64">
        {renderControl ?? (
          <AsyncSelect
            options={companyOptions}
            value={companyId ?? null}
            onChange={(val) => onCompanyChange?.(val ? String(val) : null)}
            placeholder={placeholder}
            isClearable={false}
          />
        )}
      </div>
    </div>
  );
}
