'use client';

import { CircleAlert, RefreshCcw } from 'lucide-react';
import { type ComponentType, type ReactNode } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  Skeleton,
} from '@/components/ui';
import { getErrorMessage } from '@/shared/lib/api-error';
import { cn } from '@/utils/cn';
import { DASHBOARD_LABELS } from '../constants';
import type { SummaryTone } from '../types';

const SUMMARY_TONES: Record<
  SummaryTone,
  {
    card: string;
    icon: string;
    value: string;
  }
> = {
  slate: {
    card: 'bg-slate-50 ring-slate-200',
    icon: 'bg-slate-100 text-slate-600',
    value: 'text-slate-950',
  },
  green: {
    card: 'bg-green-50 ring-green-200',
    icon: 'bg-green-100 text-green-700',
    value: 'text-green-700',
  },
  amber: {
    card: 'bg-amber-50 ring-amber-200',
    icon: 'bg-amber-100 text-amber-700',
    value: 'text-amber-700',
  },
  red: {
    card: 'bg-destructive/5 ring-destructive/20',
    icon: 'bg-destructive/10 text-destructive',
    value: 'text-destructive',
  },
  brand: {
    card: 'bg-brand-50 ring-brand-200',
    icon: 'bg-brand-100 text-brand-700',
    value: 'text-brand-700',
  },
  sky: {
    card: 'bg-sky-50 ring-sky-200',
    icon: 'bg-sky-100 text-sky-700',
    value: 'text-sky-700',
  },
};

export function SectionHeader({
  description,
  actions,
  title,
}: {
  description: string;
  actions?: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function MetricCard({
  detail,
  icon: Icon,
  label,
  tone,
  value,
}: {
  detail?: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  tone: SummaryTone;
  value: ReactNode;
}) {
  const toneStyles = SUMMARY_TONES[tone];

  return (
    <Card size="sm" className={cn('border-0 ring-1 ring-inset shadow-none', toneStyles.card)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardDescription className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              {label}
            </CardDescription>
            <div
              className={cn(
                'flex items-center gap-2 text-2xl font-semibold tracking-tight',
                toneStyles.value
              )}
            >
              {value}
            </div>
          </div>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              toneStyles.icon
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs leading-5 text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function SectionError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <CircleAlert className="h-4 w-4" />
      <AlertTitle>{DASHBOARD_LABELS.COMMON.ERROR_TITLE}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>{getErrorMessage(error, DASHBOARD_LABELS.COMMON.ERROR_DESCRIPTION)}</span>
        <div>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCcw data-icon="inline-start" />
            {DASHBOARD_LABELS.COMMON.ERROR_RETRY}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function EmptyState({
  description,
  className,
  title,
}: {
  description: string;
  className?: string;
  title: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[180px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center',
        className
      )}
    >
      <p className="text-sm font-medium text-slate-950">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <Skeleton className="h-6 w-44 rounded-full" />
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-2/3 max-w-xl" />
        </div>
        <Skeleton className="h-[118px] w-full max-w-[260px] rounded-2xl" />
      </div>
    </section>
  );
}

export function SummaryCardGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} size="sm" className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function KpiCardGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-36" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <Skeleton className="h-[70px] w-[70px] shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableCardSkeleton() {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-80" />
          </div>
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PortfolioSectionSkeleton() {
  return (
    <div className="space-y-4">
      <SummaryCardGridSkeleton count={4} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[320px] w-full rounded-2xl" />
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
