import { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Input,
} from '@/shared/components/ui';
import { toast } from '@/shared/lib/toast';
import { BILLING_ACTION_LABELS, BILLING_LABELS, BILLING_MODAL_LABELS } from '../../constants';
import type { BillingProgressDetail, BillingProgressTreeItem } from '../../types';

type Step2ProgressProps = {
  billingDetail?: BillingProgressDetail;
  isLoading?: boolean;
  isSubmitting?: boolean;
  handleNext: (progressItems: Array<{ boqItemId: string; progress: number }>) => void;
  handleBack: () => void;
};

type ProgressRow = {
  id: string;
  group: string;
  item: string;
  location: string;
  actual: number;
  readyToBill: number;
  progress: number;
};

function flattenProgressTree(
  items: BillingProgressTreeItem[],
  parentNames: string[] = []
): ProgressRow[] {
  return items.flatMap((item) => {
    const group = parentNames[0] ?? item.name;
    const locationParts = parentNames.length > 0 ? parentNames.slice(1) : [];

    const currentRow: ProgressRow[] = item.children.length
      ? []
      : [
          {
            id: item.id,
            group,
            item: item.name,
            location: locationParts.join(' / ') || item.code,
            actual: item.actualProgress ?? 0,
            readyToBill: item.readyToBill ?? 0,
            progress: item.readyToBill ?? 0,
          },
        ];

    return [...currentRow, ...flattenProgressTree(item.children, [...parentNames, item.name])];
  });
}

export function Step2Progress({
  billingDetail,
  isLoading,
  isSubmitting,
  handleNext,
  handleBack,
}: Step2ProgressProps) {
  const rows = useMemo(
    () => flattenProgressTree(billingDetail?.items ?? []),
    [billingDetail?.items]
  );
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    setProgressMap(
      rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.id] = row.progress;
        return acc;
      }, {})
    );
  }, [rows]);

  const groups = useMemo(
    () =>
      Object.entries(
        rows.reduce<Record<string, ProgressRow[]>>((acc, row) => {
          acc[row.group] ??= [];
          acc[row.group].push(row);
          return acc;
        }, {})
      ).map(([group, items]) => ({ group, items })),
    [rows]
  );

  const handleSave = () => {
    if (rows.length === 0) {
      toast.error({ title: BILLING_ACTION_LABELS.LOAD_PROGRESS_FAILED });
      return;
    }

    handleNext(
      rows.map((row) => ({
        boqItemId: row.id,
        progress: progressMap[row.id] ?? 0,
      }))
    );
  };

  return (
    <div className="mt-6 flex flex-col gap-6">
      <Accordion type="multiple" className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
              <span>{BILLING_LABELS.CREATE.PROGRESS_LOADING}</span>
            </div>
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
            {BILLING_LABELS.CREATE.PROGRESS_EMPTY}
          </div>
        ) : (
          groups.map((group) => (
            <AccordionItem
              key={group.group}
              value={group.group}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <AccordionTrigger className="px-6 py-5 text-lg font-semibold text-slate-950 hover:no-underline">
                {group.group}
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="border-t border-slate-200 bg-slate-50/80">
                  {group.items.map((item, index) => (
                    <div
                      key={item.id}
                      className={[
                        'grid grid-cols-1 gap-4 px-6 py-5 lg:grid-cols-[minmax(0,2.2fr)_140px_160px_170px] lg:items-center',
                        index !== group.items.length - 1 ? 'border-b border-slate-200' : '',
                      ].join(' ')}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-950">{item.item}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.location}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {BILLING_LABELS.CREATE.PROGRESS_ACTUAL}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{item.actual}%</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {BILLING_LABELS.CREATE.PROGRESS_READY_TO_BILL}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{item.readyToBill}%</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {BILLING_LABELS.CREATE.PROGRESS_CLIENT_BILLING}
                        </p>
                        <div className="relative mt-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={String(progressMap[item.id] ?? 0)}
                            onChange={(event) =>
                              setProgressMap((prev) => ({
                                ...prev,
                                [item.id]: Number(event.target.value || 0),
                              }))
                            }
                            className="h-11 rounded-xl border-slate-200 bg-white pr-10"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))
        )}
      </Accordion>

      <div className="mt-2 flex iBACKenter justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
          {BILLING_LABELS.CREATE.CANCEL}
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-teal-600 text-white hover:bg-teal-700"
        >
          {isSubmitting ? BILLING_MODAL_LABELS.BUTTONS.SAVING : BILLING_LABELS.CREATE.SAVE_CONTINUE}
        </Button>
      </div>
    </div>
  );
}
