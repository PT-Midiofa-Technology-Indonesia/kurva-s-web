'use client';

import { Star } from 'lucide-react';
import { Progress } from '@/shared/components/ui/progress';
import { MANPOWER_LABELS } from '../constants';
import { useEmployeeRatingSummary } from '../hooks/use-employee-rating-summary';
import {
  formatEmployeeRatingDate,
  formatEmployeeRatingSummaryCategoryLabel,
  formatEmployeeRatingValue,
} from '../utils/rating';

interface EmployeeRatingSummaryProps {
  employeeId: string;
}

function RatingSummarySkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="rounded-xl border bg-slate-50 p-5 space-y-4">
        <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
        <div className="h-10 w-28 rounded bg-slate-200 animate-pulse" />
        <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-slate-50 p-4 space-y-3">
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-10 rounded bg-slate-200 animate-pulse" />
            <div className="h-2 w-full rounded bg-slate-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmployeeRatingSummary({ employeeId }: EmployeeRatingSummaryProps) {
  const ratingLabels = MANPOWER_LABELS.DETAIL.RATING;
  const { data: ratingSummary, isLoading: isSummaryLoading } = useEmployeeRatingSummary({
    employeeId,
  });
  const summary = ratingSummary?.data ?? null;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900">{ratingLabels.SUMMARY_TITLE}</h2>
          <p className="text-sm text-slate-500">{ratingLabels.SUMMARY_DESCRIPTION}</p>
        </div>
      </div>

      {isSummaryLoading && !summary ? (
        <RatingSummarySkeleton />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-xl border bg-slate-50 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Star className="h-4 w-4 text-amber-400" />
              <span>Overall Score</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-semibold tracking-tight text-slate-950">
                {formatEmployeeRatingValue(summary?.overallAvg)}
              </p>
              <p className="text-sm text-slate-500">{summary?.totalRatings ?? 0} rating</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {ratingLabels.SUMMARY.LAST_RATED_AT}
              </p>
              <p className="text-sm font-medium text-slate-900">
                {formatEmployeeRatingDate(summary?.lastRatedAt ?? '')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {summary?.perCategory?.length ? (
              summary.perCategory.map((category) => (
                <div
                  key={`${category.categoryCode}-${category.categoryName}`}
                  className="rounded-xl border bg-white p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {formatEmployeeRatingSummaryCategoryLabel(category)}
                      </p>
                      <p className="text-xs text-slate-500">{category.count} rating</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatEmployeeRatingValue(category.avgScore)}
                    </p>
                  </div>
                  <Progress value={(category.avgScore / 5) * 100} className="h-2" />
                </div>
              ))
            ) : (
              <div className="flex min-h-[212px] items-center justify-center rounded-xl border border-dashed bg-slate-50 px-6 text-sm text-slate-500">
                {ratingLabels.EMPTY}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
