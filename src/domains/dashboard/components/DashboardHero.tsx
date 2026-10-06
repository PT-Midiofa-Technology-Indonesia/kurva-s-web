'use client';

import { DASHBOARD_LABELS } from '../constants';

export function DashboardHero({ role, userName }: { role: string; userName: string }) {
  return (
    <section className="rounded-xl bg-slate-50 px-6 py-6 text-slate-800 border">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            {DASHBOARD_LABELS.GREETING}, {userName}
          </h1>
          <p className="text-sm text-slate-500">
            {DASHBOARD_LABELS.ROLE_LABEL} {role}
          </p>
        </div>
      </div>
    </section>
  );
}
