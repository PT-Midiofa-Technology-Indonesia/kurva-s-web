'use client';

import { formatDateLong } from '@/shared/utils/format';
import { formatPhone } from '@/shared/utils/masks';
import { AUTH_LABELS } from '../constants';
import { useMe } from '../hooks/use-me';

export function ProfilePage() {
  const { data: user, isPending, isError, error } = useMe();

  if (isPending) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-xl">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="h-4 bg-slate-200 rounded w-64" />
          <div className="mt-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-500">{error?.message ?? AUTH_LABELS.PROFILE.ERROR}</p>
      </div>
    );
  }

  const { FIELDS, STATUS } = AUTH_LABELS.PROFILE;
  const fields: { label: string; value: string }[] = [
    { label: FIELDS.NAME, value: user.name },
    { label: FIELDS.EMAIL, value: user.email },
    { label: FIELDS.PHONE, value: formatPhone(user.phoneNumber) },
    { label: FIELDS.STATUS, value: user.isActive ? STATUS.ACTIVE : STATUS.INACTIVE },
    {
      label: FIELDS.ROLE,
      value: user.roles.length > 0 ? user.roles.map((role) => role.name).join(', ') : '-',
    },
    {
      label: FIELDS.JOINED,
      value: formatDateLong(user.createdAt),
    },
  ];

  return (
    <div className="p-8 w-full">
      <h1 className="text-lg font-semibold text-slate-950">{AUTH_LABELS.PROFILE.PAGE_TITLE}</h1>
      <p className="text-sm text-slate-500 mt-1">{AUTH_LABELS.PROFILE.PAGE_SUBTITLE}</p>

      <div className="mt-8 divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex items-center px-5 py-4 bg-white">
            <span className="w-40 shrink-0 text-sm text-slate-500">{label}</span>
            <span className="text-sm font-medium text-slate-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
