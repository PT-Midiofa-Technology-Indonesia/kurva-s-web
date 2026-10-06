'use client';

import { format, parseISO } from 'date-fns';
import { LoaderCircle } from 'lucide-react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import type { SelectOption } from '@/components/atoms';
import { AsyncSelect, Button } from '@/components/atoms';
import { DatePicker } from '@/shared/components/molecules/DatePicker';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { ProjectManpowerRatingFormValues } from '../schemas/project-manpower-rating';
import type { ProjectManpowerRatingCategory } from '../types/project-manpower-rating';

const SCORE_OPTIONS = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
] as const;

function getCategoryScoreError(errors: unknown, index: number) {
  const categoryErrors = (errors as { categoryScores?: Array<{ score?: { message?: string } }> })
    .categoryScores;
  return categoryErrors?.[index]?.score?.message;
}

interface ProjectManpowerRatingFormProps {
  form: UseFormReturn<ProjectManpowerRatingFormValues, any, any>;
  employeeOptions: SelectOption[];
  isEmployeeLoading: boolean;
  isRatingLoading: boolean;
  isRatingRefreshing: boolean;
  activeCategories: ProjectManpowerRatingCategory[];
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: ProjectManpowerRatingFormValues) => void | Promise<void>;
  isSubmitting: boolean;
  serverMessage?: string | null;
  onEmployeeSearchChange: (value: string) => void;
  onEmployeeChange: (employeeId: string | null) => void;
}

export function ProjectManpowerRatingForm({
  form,
  employeeOptions,
  isEmployeeLoading,
  isRatingLoading,
  isRatingRefreshing,
  activeCategories,
  submitLabel,
  onCancel,
  onSubmit,
  isSubmitting,
  serverMessage,
  onEmployeeSearchChange,
  onEmployeeChange,
}: ProjectManpowerRatingFormProps) {
  const employeeError = form.formState.errors.employeeId?.message;
  const ratedAtError = form.formState.errors.ratedAt?.message;
  const categoryScoreBanner = (
    form.formState.errors.categoryScores as { message?: string } | undefined
  )?.message;
  const selectedEmployeeId = form.watch('employeeId');
  const canSubmit =
    !isSubmitting &&
    !isRatingLoading &&
    !isRatingRefreshing &&
    activeCategories.length > 0 &&
    !!selectedEmployeeId;

  return (
    <form className="flex h-full min-h-0 flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
      {(serverMessage || categoryScoreBanner) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverMessage ?? categoryScoreBanner}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label className="text-sm font-medium text-slate-700">Manpower</Label>
          <Controller
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <AsyncSelect
                value={field.value || null}
                options={employeeOptions}
                isSearchable
                isClearable
                isLoading={isEmployeeLoading}
                placeholder="Cari manpower"
                noOptionsMessage="Manpower tidak ditemukan"
                loadingMessage="Memuat manpower..."
                invalid={!!employeeError}
                onChange={(value) => {
                  const nextValue = Array.isArray(value) ? value[0] : (value ?? null);
                  field.onChange(nextValue || '');
                  onEmployeeChange(nextValue || null);
                  onEmployeeSearchChange('');
                }}
                onSearchChange={onEmployeeSearchChange}
                aria-label="Manpower"
              />
            )}
          />
          {employeeError && <p className="text-xs text-red-600">{employeeError}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Tanggal rating</Label>
          <Controller
            control={form.control}
            name="ratedAt"
            render={({ field }) => (
              <DatePicker
                value={field.value ? parseISO(field.value) : null}
                onChange={(value) => {
                  if (value instanceof Date) {
                    field.onChange(format(value, 'yyyy-MM-dd'));
                    return;
                  }
                  field.onChange('');
                }}
                maxDate={new Date()}
                clearable={false}
                showChevron
                placeholder="Pilih tanggal rating"
              />
            )}
          />
          {ratedAtError && <p className="text-xs text-red-600">{ratedAtError}</p>}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-900">Kategori Rating</h3>
            <p className="text-xs text-slate-500">
              {selectedEmployeeId
                ? 'Pilih skor 1 sampai 5 untuk setiap kategori.'
                : 'Pilih manpower untuk memuat kategori rating.'}
            </p>
          </div>
          {isRatingRefreshing && (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Memuat rating...
            </span>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {isRatingLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3"
                >
                  <div className="h-4 w-2/3 rounded bg-slate-200" />
                  <div className="h-9 rounded-lg bg-slate-200" />
                </div>
              ))}
            </div>
          ) : !selectedEmployeeId ? (
            <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
              Belum ada manpower yang dipilih.
            </div>
          ) : activeCategories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
              Belum ada kategori rating aktif.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeCategories.map((category, index) => {
                const scoreError = getCategoryScoreError(form.formState.errors, index);

                return (
                  <div
                    key={category.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="space-y-1.5">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-slate-900">{category.name}</p>
                        {category.description && (
                          <p className="text-xs text-slate-500">{category.description}</p>
                        )}
                      </div>

                      <Controller
                        control={form.control}
                        name={`categoryScores.${index}.score`}
                        render={({ field }) => (
                          <Select
                            value={field.value > 0 ? String(field.value) : ''}
                            onValueChange={(value) => field.onChange(Number(value))}
                            disabled={isRatingRefreshing}
                          >
                            <SelectTrigger
                              aria-label={`${category.name} score`}
                              className="w-full bg-white"
                            >
                              <SelectValue placeholder="Pilih rating" />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start" sideOffset={4}>
                              <SelectGroup>
                                {SCORE_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />

                      {scoreError && <p className="text-xs text-red-600">{scoreError}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
