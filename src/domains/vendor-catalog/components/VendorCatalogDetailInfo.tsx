'use client';

import { Pencil, Star } from 'lucide-react';
import { Button } from '@/components/atoms';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import { Switch } from '@/shared/components/ui/switch';
import { formatDateLong } from '@/shared/utils/format';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { useVendorRatingSummary } from '../hooks/use-vendor-rating-summary';
import type { VendorCatalog } from '../types';
import { formatVendorRatingSummaryCategoryLabel, formatVendorRatingValue } from '../utils/rating';

interface VendorDetailInfoProps {
  vendor: VendorCatalog;
  vendorId: string;
  onEdit: () => void;
  onStatusToggle?: (isActive: boolean) => void;
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

export function VendorCatalogDetailInfo({
  vendor,
  vendorId,
  onEdit,
  onStatusToggle,
}: VendorDetailInfoProps) {
  const labels = VENDOR_CATALOG_LABELS.DETAIL;
  const ratingLabels = VENDOR_CATALOG_LABELS.RATING;
  const { data: ratingSummary, isLoading: isSummaryLoading } = useVendorRatingSummary({ vendorId });
  const summary = ratingSummary?.data ?? null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">{labels.INFO_CARD_TITLE}</h2>
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            {labels.EDIT_BUTTON}
          </Button>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-normal text-slate-400">{labels.FIELDS.CODE}</Label>
            <p className="text-sm font-medium text-slate-900">{vendor.code ?? '-'}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-normal text-slate-400">{labels.FIELDS.NAME}</Label>
            <p className="text-sm font-medium text-slate-900">{vendor.name ?? '-'}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-normal text-slate-400">{labels.FIELDS.TYPE}</Label>
            <div className="flex flex-wrap gap-1.5">
              {vendor.isSubcontractor && <Badge variant="secondary">Subcontractor</Badge>}
              {vendor.isSupplier && <Badge variant="secondary">Supplier</Badge>}
              {vendor.isLogistic && <Badge variant="secondary">Logistic</Badge>}
              {!vendor.isSubcontractor && !vendor.isSupplier && !vendor.isLogistic && (
                <span className="text-sm text-slate-500">-</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-normal text-slate-400">{labels.FIELDS.STATUS}</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={vendor.isActive}
                onCheckedChange={onStatusToggle}
                className="data-[state=checked]:bg-brand-600"
              />
              <span className="text-sm font-medium text-slate-900">
                {vendor.isActive ? labels.STATUS_ACTIVE : labels.STATUS_INACTIVE}
              </span>
            </div>
          </div>

          <div className="border-t pt-5 space-y-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-normal text-slate-400">
                  {labels.FIELDS.PROVINCE}
                </Label>
                <p className="text-sm font-medium text-slate-900">{vendor.province?.name ?? '-'}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-normal text-slate-400">{labels.FIELDS.CITY}</Label>
                <p className="text-sm font-medium text-slate-900">{vendor.city?.name ?? '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-normal text-slate-400">
                  {labels.FIELDS.DISTRICT}
                </Label>
                <p className="text-sm font-medium text-slate-900">{vendor.district?.name ?? '-'}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-normal text-slate-400">
                  {labels.FIELDS.VILLAGE}
                </Label>
                <p className="text-sm font-medium text-slate-900">{vendor.village?.name ?? '-'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-slate-400">{labels.FIELDS.ADDRESS}</Label>
              <p className="text-sm font-medium text-slate-900">{vendor.addressDetail || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">{ratingLabels.SUMMARY_TITLE}</h2>
            <p className="text-sm text-slate-500">
              Rata-rata rating vendor berdasarkan seluruh purchase order.
            </p>
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
                  {formatVendorRatingValue(summary?.overallAvg)}
                </p>
                <p className="text-sm text-slate-500">{summary?.totalRatings ?? 0} rating</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {ratingLabels.SUMMARY.LAST_RATED_AT}
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDateLong(summary?.lastRatedAt ?? '')}
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
                          {formatVendorRatingSummaryCategoryLabel(category)}
                        </p>
                        <p className="text-xs text-slate-500">{category.count} rating</p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-slate-900">
                        {formatVendorRatingValue(category.avgScore)}
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
    </div>
  );
}
