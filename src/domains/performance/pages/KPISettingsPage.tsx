'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Calendar,
  Settings,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import { CompanyInfoBanner, Tabs, WeightSlider } from '@/shared/components/molecules';
import { SearchBar } from '@/shared/components/molecules/SearchBar';
import { DataTable } from '@/shared/components/organisms/DataTable';
import {
  Card,
  CardContent,
  CardHeader,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { PERFORMANCE_LABELS } from '../constants';
import { useCompanySettings, useEmployeeGrades, useUpdateCompanySettings } from '../hooks';
import type {
  EmployeeGradeSetting,
  KPICompanyGradeThreshold,
  KPICompanyPillarWeight,
} from '../types';

const fallbackPillars: KPICompanyPillarWeight[] = [
  { name: PERFORMANCE_LABELS.DETAIL.PILLARS.PRODUCTIVITY, code: 'productivity', weight: 0 },
  { name: PERFORMANCE_LABELS.DETAIL.PILLARS.ATTENDANCE, code: 'attendance', weight: 0 },
  { name: PERFORMANCE_LABELS.DETAIL.PILLARS.WORK_QUALITY, code: 'quality', weight: 0 },
  { name: PERFORMANCE_LABELS.DETAIL.PILLARS.VIOLATION, code: 'violation', weight: 0 },
];

const fallbackThresholds: KPICompanyGradeThreshold[] = [
  { grade: 'A', minScore: 91, maxScore: 100 },
  { grade: 'B', minScore: 81, maxScore: 90 },
  { grade: 'C', minScore: 71, maxScore: 80 },
  { grade: 'D', minScore: 61, maxScore: 70 },
  { grade: 'E', minScore: 0, maxScore: 59 },
];

function getPillarIcon(code?: string, name?: string) {
  const key = `${code ?? ''} ${name ?? ''}`.toLowerCase();
  if (key.includes('hadir') || key.includes('attendance'))
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <Calendar className="h-4 w-4" />
      </div>
    );
  if (key.includes('kualitas') || key.includes('quality'))
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
        <Award className="h-4 w-4" />
      </div>
    );
  if (key.includes('langgar') || key.includes('violation'))
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
        <ShieldAlert className="h-4 w-4" />
      </div>
    );
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
      <TrendingUp className="h-4 w-4" />
    </div>
  );
}

function getGradeBadgeStyle(grade?: string) {
  const g = (grade ?? '').toUpperCase();
  if (g === 'A') return 'bg-emerald-500 text-white';
  if (g === 'B') return 'bg-lime-500 text-white';
  if (g === 'C') return 'bg-amber-500 text-white';
  if (g === 'D') return 'bg-slate-500 text-white';
  return 'bg-rose-500 text-white';
}

export function KPISettingsPage() {
  const router = useRouter();
  const { queryParams, setQueryParams } = useQueryParams<{
    page?: number;
    perPage?: number;
    search?: string;
  }>();
  const [searchValue, setSearchValue] = useState(queryParams.search ?? '');
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  useEffect(() => {
    setSearchValue(queryParams.search ?? '');
  }, [queryParams.search]);
  const [pillars, setPillars] = useState(fallbackPillars);
  const [thresholds, setThresholds] = useState(fallbackThresholds);
  const companySettings = useCompanySettings({ companyId });
  const grades = useEmployeeGrades({
    companyId,
    page: Number(queryParams.page ?? 1),
    perPage: Number(queryParams.perPage ?? 10),
    search: queryParams.search,
  });
  const updateSettings = useUpdateCompanySettings(companyId);

  useEffect(() => {
    const data = companySettings.data?.data;
    setPillars(data?.pillarWeights ?? data?.pillars ?? fallbackPillars);
    setThresholds(data?.gradeThresholds ?? data?.grades ?? fallbackThresholds);
  }, [companySettings.data]);

  const total = pillars.reduce((sum, item) => sum + Number(item.weight || 0), 0);

  const columns = useMemo<ColumnDef<EmployeeGradeSetting>[]>(
    () => [
      { accessorKey: 'code', header: PERFORMANCE_LABELS.SETTINGS.COLUMNS.GOLONGAN },
      { accessorKey: 'name', header: PERFORMANCE_LABELS.SETTINGS.COLUMNS.NAMA_GOLONGAN },
      {
        accessorKey: 'component',
        header: PERFORMANCE_LABELS.SETTINGS.COLUMNS.KPI_COMPONENT,
        cell: ({ row }) =>
          `${row.original.totalKpiComponents} ${PERFORMANCE_LABELS.SETTINGS.LABELS.COMPONENTS_COUNT}`,
      },
      {
        accessorKey: 'grade',
        header: PERFORMANCE_LABELS.SETTINGS.COLUMNS.GRADE,
        cell: ({ row }) =>
          `${row.original.totalGrades} ${PERFORMANCE_LABELS.SETTINGS.LABELS.GRADES_FILLED}`,
      },
      {
        accessorKey: 'status',
        header: PERFORMANCE_LABELS.SETTINGS.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.status ? (
            <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {PERFORMANCE_LABELS.SETTINGS.STATUS.CONFIGURED}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
              {PERFORMANCE_LABELS.SETTINGS.STATUS.NOT_CONFIGURED}
            </span>
          ),
      },
      {
        id: 'action',
        header: PERFORMANCE_LABELS.SETTINGS.COLUMNS.ACTION,
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              router.push(
                `/human-resource/kpi/settings/${row.original.id}?code=${row.original.code}`
              )
            }
          >
            <Settings className="mr-2 h-4 w-4" />
          </Button>
        ),
      },
    ],
    [router]
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => router.push('/human-resource/kpi')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="font-semibold">{PERFORMANCE_LABELS.SETTINGS.TITLE}</div>
      </div>

      <CompanyInfoBanner
        companyId={companyId}
        companyOptions={companyOptions}
        onCompanyChange={handleCompanyChange}
        message={PERFORMANCE_LABELS.SETTINGS.COMPANY_BANNER}
        placeholder={PERFORMANCE_LABELS.LIST.FILTERS.COMPANY}
      />

      <Tabs
        variant="underline"
        defaultActiveKey="weights"
        className="mb-6 border-b-0 px-0"
        contentClassName="mt-0"
        items={[
          {
            key: 'weights',
            label: PERFORMANCE_LABELS.SETTINGS.TABS.WEIGHTS,
            content: (
              <Card className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {PERFORMANCE_LABELS.SETTINGS.WEIGHTS_SECTION}
                    </h2>
                    <div className="mt-4 space-y-4">
                      {pillars.map((pillar, index) => (
                        <WeightSlider
                          key={pillar.id ?? pillar.code ?? pillar.name}
                          label={pillar.name}
                          value={pillar.weight || 0}
                          icon={getPillarIcon(pillar.code, pillar.name)}
                          onChange={(val) => {
                            const next = [...pillars];
                            next[index] = { ...pillar, weight: val };
                            setPillars(next);
                          }}
                        />
                      ))}
                    </div>

                    {total !== 100 && (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {PERFORMANCE_LABELS.SETTINGS.LABELS.TOTAL} {total}% ·{' '}
                        {PERFORMANCE_LABELS.SETTINGS.PICKER.MUST_BE_100}
                      </div>
                    )}
                  </div>

                  <hr className="border-slate-200" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {PERFORMANCE_LABELS.SETTINGS.THRESHOLDS_SECTION}
                    </h2>
                    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="font-semibold text-slate-700">
                              {PERFORMANCE_LABELS.SETTINGS.COLUMNS.GRADE}
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              {PERFORMANCE_LABELS.SETTINGS.COLUMNS.MIN_SCORE}
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              {PERFORMANCE_LABELS.SETTINGS.COLUMNS.MAX_SCORE}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {thresholds.map((grade, index) => {
                            const gLabel = grade.grade ?? grade.code ?? grade.name ?? 'A';
                            return (
                              <TableRow key={grade.id ?? grade.grade ?? grade.code}>
                                <TableCell>
                                  <span
                                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${getGradeBadgeStyle(
                                      gLabel
                                    )}`}
                                  >
                                    {gLabel}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="relative max-w-[140px]">
                                    <Input
                                      type="number"
                                      className="h-9 pr-7 text-right"
                                      value={grade.minScore}
                                      onChange={(event) => {
                                        const next = [...thresholds];
                                        next[index] = {
                                          ...grade,
                                          minScore: Number(event.target.value),
                                        };
                                        setThresholds(next);
                                      }}
                                    />
                                    <span className="pointer-events-none absolute right-3 top-2 text-sm text-slate-400">
                                      %
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="relative max-w-[140px]">
                                    <Input
                                      type="number"
                                      className="h-9 pr-7 text-right"
                                      value={grade.maxScore}
                                      onChange={(event) => {
                                        const next = [...thresholds];
                                        next[index] = {
                                          ...grade,
                                          maxScore: Number(event.target.value),
                                        };
                                        setThresholds(next);
                                      }}
                                    />
                                    <span className="pointer-events-none absolute right-3 top-2 text-sm text-slate-400">
                                      %
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      className="bg-cyan-700 px-6 text-white hover:bg-cyan-800"
                      disabled={!companyId || total !== 100 || updateSettings.isPending}
                      onClick={() =>
                        updateSettings.mutate({
                          pillars: pillars
                            .filter((pillar) => pillar.performancePillarId)
                            .map((pillar) => ({
                              performancePillarId: pillar.performancePillarId as string,
                              weight: Number(pillar.weight),
                            })),
                          grades: thresholds
                            .filter((grade) => grade.performanceGradeId)
                            .map((grade) => ({
                              performanceGradeId: grade.performanceGradeId as string,
                              minScore: Number(grade.minScore),
                              maxScore: Number(grade.maxScore),
                            })),
                        })
                      }
                    >
                      {PERFORMANCE_LABELS.SETTINGS.SAVE_BUTTON}
                    </Button>
                  </div>
                </div>
              </Card>
            ),
          },
          {
            key: 'grades',
            label: PERFORMANCE_LABELS.SETTINGS.TABS.REWARDS,
            content: (
              <Card>
                <CardHeader>
                  <div className="max-w-sm">
                    <SearchBar
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onDebounce={(search) =>
                        setQueryParams({ search: search || undefined, page: 1 })
                      }
                      onClear={() => {
                        setSearchValue('');
                        setQueryParams({ search: undefined, page: 1 });
                      }}
                      placeholder={PERFORMANCE_LABELS.DETAIL.SEARCH.PLACEHOLDER}
                      showClear
                      width="100%"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={grades.data?.data ?? []}
                    isLoading={grades.isLoading}
                    enablePagination
                    initialPage={Number(queryParams.page ?? 1)}
                    initialPageSize={Number(queryParams.perPage ?? 10)}
                    totalPages={grades.data?.meta?.lastPage ?? 1}
                    totalItems={
                      grades.data?.meta?.total ? Number(grades.data.meta.total) : undefined
                    }
                    onPaginationChange={(page, perPage) => setQueryParams({ page, perPage })}
                  />
                </CardContent>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
