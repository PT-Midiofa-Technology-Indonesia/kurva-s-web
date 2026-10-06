'use client';

import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Gift,
  LineChart,
  Star,
  User,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { MonthYearPicker } from '@/shared/components/molecules/MonthYearPicker';
import { SearchBar } from '@/shared/components/molecules/SearchBar/SearchBar';
import { Tabs } from '@/shared/components/molecules/Tabs';
import { DataTable } from '@/shared/components/organisms/DataTable';
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { GRADE_THEMES, PERFORMANCE_LABELS } from '../constants';
import {
  useEmployeeDetail,
  useEmployeeHistory,
  useEmployeeProjectDetail,
  useEmployeeProjectHistory,
  useEmployeeViolations,
} from '../hooks';
import type { PerformanceHistory, ProjectHistory } from '../types';

export function KPIDetailPage() {
  const params = useParams<{ id?: string }>();
  const targetId = params.id ?? '';
  const router = useRouter();
  const { queryParams, setQueryParams } = useQueryParams<{
    month?: string;
    year?: string;
    search?: string;
  }>();

  const { companyId } = useCompanyFilter();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const parsedYear = queryParams.year ? Number(queryParams.year) : undefined;
  const parsedMonth = queryParams.month ? Number(queryParams.month) : undefined;
  const hasValidYear =
    typeof parsedYear === 'number' && Number.isInteger(parsedYear) && parsedYear > 0;
  const hasValidMonth =
    parsedMonth === undefined ||
    (typeof parsedMonth === 'number' &&
      Number.isInteger(parsedMonth) &&
      parsedMonth >= 1 &&
      parsedMonth <= 12);
  const selectedYear = typeof parsedYear === 'number' && hasValidYear ? parsedYear : undefined;
  const selectedMonth = typeof parsedMonth === 'number' && hasValidMonth ? parsedMonth : undefined;
  const displayYear = selectedYear ?? currentYear;
  const displayMonth = selectedMonth ?? currentMonth;
  const canFetchPeriodData = Boolean(targetId && companyId && hasValidYear && hasValidMonth);

  const [periodMode, setPeriodMode] = useState<'month' | 'year'>(
    queryParams.month || !queryParams.year ? 'month' : 'year'
  );

  useEffect(() => {
    setPeriodMode(queryParams.month || !queryParams.year ? 'month' : 'year');
  }, [queryParams.month, queryParams.year]);

  const yearOptions = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, [currentYear]);

  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<PerformanceHistory | null>(
    null
  );
  const [selectedProjectRecord, setSelectedProjectRecord] = useState<ProjectHistory | null>(null);

  // Extract month & year from selected history record's period (e.g., "2026-08" or "2026-08-01")
  const historyPeriodMonth = selectedHistoryRecord?.period
    ? Number.parseInt(selectedHistoryRecord.period.split('-')[1], 10)
    : undefined;
  const historyPeriodYear = selectedHistoryRecord?.period
    ? Number.parseInt(selectedHistoryRecord.period.split('-')[0], 10)
    : undefined;

  // Accordion expanded state for detail modal (default true / expanded semua)
  const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>({
    productivity: true,
    attendance: true,
    quality: true,
    violation: true,
  });

  const togglePillar = (pillarKey: string) => {
    setExpandedPillars((prev) => ({
      ...prev,
      [pillarKey]: !prev[pillarKey],
    }));
  };

  const apiParams = useMemo(
    () => ({
      companyId: companyId ?? undefined,
      month: hasValidMonth ? selectedMonth : undefined,
      year: hasValidYear ? selectedYear : undefined,
    }),
    [companyId, hasValidMonth, hasValidYear, selectedMonth, selectedYear]
  );

  const historyApiParams = useMemo(
    () => ({
      companyId: companyId ?? undefined,
      month: hasValidMonth ? selectedMonth : undefined,
      year: hasValidYear ? selectedYear : undefined,
      search: queryParams.search,
    }),
    [companyId, hasValidMonth, hasValidYear, selectedMonth, selectedYear, queryParams.search]
  );

  const { data: employeeDetail } = useEmployeeDetail(targetId, apiParams, {
    enabled: canFetchPeriodData,
  });
  const { data: historyData, isLoading: isLoadingHistory } = useEmployeeHistory(
    targetId,
    historyApiParams,
    { enabled: canFetchPeriodData }
  );
  const { data: projectData, isLoading: isLoadingProjects } = useEmployeeProjectHistory(
    targetId,
    apiParams,
    { enabled: Boolean(targetId && companyId) }
  );
  const { data: violationData, isLoading: isLoadingViolations } = useEmployeeViolations(
    targetId,
    apiParams,
    { enabled: Boolean(targetId && companyId) }
  );

  const selectedProjectId = selectedProjectRecord?.id ?? '';
  const { data: projectDetailData } = useEmployeeProjectDetail(targetId, selectedProjectId, {
    companyId: companyId ?? undefined,
  });

  // Fetch employee detail for the selected history period (for modal)
  const historyDetailParams = useMemo(
    () =>
      historyPeriodMonth && historyPeriodYear
        ? {
            companyId: companyId ?? undefined,
            month: historyPeriodMonth,
            year: historyPeriodYear,
          }
        : undefined,
    [companyId, historyPeriodMonth, historyPeriodYear]
  );

  const { data: historyDetailData } = useEmployeeDetail(targetId, historyDetailParams, {
    enabled: Boolean(historyDetailParams),
  });

  const employee = employeeDetail?.employee;
  const totalScore = employeeDetail?.totalScore ?? employeeDetail?.score ?? 0;
  const gradeCode =
    employeeDetail?.grade?.code ??
    employeeDetail?.grade?.name ??
    employeeDetail?.grade?.grade ??
    '-';

  const minVal = employeeDetail?.grade?.minValue ?? employeeDetail?.grade?.minScore ?? 0;
  const maxVal = employeeDetail?.grade?.maxValue ?? employeeDetail?.grade?.maxScore ?? 100;
  const rewards = employeeDetail?.rewards ?? [];
  const punishments = employeeDetail?.punishments ?? [];

  const gradeKey =
    (gradeCode.toUpperCase() as keyof typeof GRADE_THEMES) in GRADE_THEMES
      ? (gradeCode.toUpperCase() as keyof typeof GRADE_THEMES)
      : 'E';
  const theme = GRADE_THEMES[gradeKey];

  const historyRecords = historyData?.data ?? [];
  const violationRecords: ProjectHistory[] = violationData?.data ?? [];
  const projectRecords: ProjectHistory[] = projectData?.data ?? [];

  const handleMonthYearChange = (date: Date) => {
    setQueryParams({
      month: String(date.getMonth() + 1),
      year: String(date.getFullYear()),
    });
  };

  const handleBack = () => {
    const params = new URLSearchParams();
    if (queryParams.month) params.set('month', queryParams.month);
    if (queryParams.year) params.set('year', queryParams.year);
    const queryString = params.toString();
    router.push(`/human-resource/kpi${queryString ? `?${queryString}` : ''}`);
  };

  const employeeInitials = useMemo(() => {
    if (!employee?.name) return 'AP';
    return employee.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }, [employee?.name]);

  return (
    <div className="space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </Button>
          <div className="font-semibold text-slate-900">{PERFORMANCE_LABELS.DETAIL.DETAIL_KPI}</div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white shadow-2xs">
                {employeeInitials}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {employee?.name ?? 'Agus Prasetyo'}
                </h2>
                <p className="text-xs text-slate-500">{employee?.position ?? 'Staff Produksi'}</p>
              </div>
            </div>
          </div>

          {/* Right Section: Filter Tanggal (Bulan | Tahun + MonthYearPicker/Select) */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => {
                  setPeriodMode('month');
                  if (!queryParams.month)
                    setQueryParams({ month: String(currentMonth), year: String(displayYear) });
                }}
                className={`h-7 px-3 text-xs font-medium rounded-md transition-all ${
                  periodMode === 'month'
                    ? 'bg-emerald-100 text-emerald-950 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                {PERFORMANCE_LABELS.LIST.FILTERS.MONTH}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => {
                  setPeriodMode('year');
                  setQueryParams({ month: undefined, year: String(displayYear) });
                }}
                className={`h-7 px-3 text-xs font-medium rounded-md transition-all ${
                  periodMode === 'year'
                    ? 'bg-emerald-100 text-emerald-950 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                {PERFORMANCE_LABELS.LIST.FILTERS.YEAR}
              </Button>
            </div>

            <div className="w-44">
              {periodMode === 'month' ? (
                <MonthYearPicker
                  value={new Date(displayYear, displayMonth - 1)}
                  onChange={handleMonthYearChange}
                  className="w-full h-9 border-slate-200 text-xs font-medium"
                />
              ) : (
                <Select
                  value={String(displayYear)}
                  onValueChange={(y) => setQueryParams({ month: undefined, year: y })}
                >
                  <SelectTrigger className="w-full h-9 border-slate-200 text-xs font-medium bg-white">
                    <SelectValue placeholder={PERFORMANCE_LABELS.LIST.FILTERS.SELECT_YEAR} />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">
            {PERFORMANCE_LABELS.DETAIL.PILLARS.PRODUCTIVITY}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {employeeDetail?.pillars?.find((p) => p.code === 'productivity')?.score ?? 0}%
          </p>
        </Card>

        <Card className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">
            {PERFORMANCE_LABELS.DETAIL.PILLARS.ATTENDANCE}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {employeeDetail?.pillars?.find((p) => p.code === 'attendance')?.score ?? 0}%
          </p>
        </Card>

        <Card className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">
            {PERFORMANCE_LABELS.DETAIL.PILLARS.WORK_QUALITY}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {employeeDetail?.pillars?.find((p) => p.code === 'work_quality')?.score ?? 0}%
          </p>
        </Card>

        <Card className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">
            {PERFORMANCE_LABELS.DETAIL.PILLARS.VIOLATION}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {employeeDetail?.pillars?.find((p) => p.code === 'violation')?.score ?? 0}%
          </p>
        </Card>

        <Card className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">
            {PERFORMANCE_LABELS.DETAIL.PILLARS.TOTAL_ASSESSMENT}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalScore}%</p>
        </Card>
      </div>

      {/* Dynamic Grade Theme Summary Banner */}
      <Card className={`rounded-2xl border p-6 shadow-sm ${theme.cardBg}`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={theme.badgeBg}>
                {PERFORMANCE_LABELS.DETAIL.CARDS.FINAL_RESULT}
              </Badge>
              <Badge variant="outline" className={theme.pillBg}>
                {PERFORMANCE_LABELS.DETAIL.CARDS.TEMPORARY}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${theme.circleBg}`}
              >
                {gradeCode}
              </span>
              <div>
                <h2 className={`text-xl font-bold ${theme.titleText}`}>
                  {PERFORMANCE_LABELS.LIST.COLUMNS.GRADE} {gradeCode}
                </h2>
                <p className={`text-sm font-medium ${theme.subText}`}>
                  {PERFORMANCE_LABELS.DETAIL.CARDS.TOTAL_SCORE} {totalScore}% ·{' '}
                  {PERFORMANCE_LABELS.DETAIL.CARDS.SCORE_RANGE} {minVal}–{maxVal}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:w-[480px]">
            <div className={`rounded-xl border bg-white/90 p-4 shadow-xs ${theme.boxBorder}`}>
              <div
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${theme.headerText}`}
              >
                <Gift className="h-4 w-4" />
                <span>{PERFORMANCE_LABELS.DETAIL.REWARDS.LABEL}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {rewards.length > 0 ? (
                  rewards.map((r) => (
                    <span
                      key={r.id}
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${theme.rewardPill}`}
                    >
                      {r.name ?? r.code ?? r.title}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">
                    {PERFORMANCE_LABELS.DETAIL.REWARDS.NO_REWARD}
                  </span>
                )}
              </div>
            </div>

            <div className={`rounded-xl border bg-white/90 p-4 shadow-xs ${theme.boxBorder}`}>
              <div
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${theme.headerText}`}
              >
                <User className="h-4 w-4" />
                <span>{PERFORMANCE_LABELS.DETAIL.PUNISHMENTS.LABEL}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {punishments.length > 0 ? (
                  punishments.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800"
                    >
                      {p.name ?? p.code ?? p.title}
                    </span>
                  ))
                ) : (
                  <p className="text-xs font-medium text-slate-600">
                    {PERFORMANCE_LABELS.DETAIL.PUNISHMENTS.NO_PUNISHMENT}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Section */}
      <Card className="rounded-xl border bg-white p-6 shadow-sm">
        <Tabs
          variant="underline"
          defaultActiveKey="history"
          items={[
            {
              key: 'history',
              label: PERFORMANCE_LABELS.DETAIL.TABS.HISTORY,
              content: (
                <div className="mt-4 space-y-4">
                  <div className="max-w-sm">
                    <SearchBar
                      value={queryParams.search ?? ''}
                      onDebounce={(val) => setQueryParams({ search: val || undefined })}
                      placeholder={PERFORMANCE_LABELS.DETAIL.SEARCH.PLACEHOLDER}
                      showClear
                      width="100%"
                    />
                  </div>
                  <DataTable<PerformanceHistory, unknown>
                    columns={[
                      {
                        accessorKey: 'period',
                        header: PERFORMANCE_LABELS.DETAIL.HISTORY.PERIOD,
                        cell: ({ row }) => (
                          <span className="font-semibold">{row.original.period ?? '-'}</span>
                        ),
                      },
                      {
                        accessorKey: 'productivity',
                        header: PERFORMANCE_LABELS.DETAIL.HISTORY.PRODUCTIVITY,
                        cell: ({ row }) => {
                          const p = row.original.pillars?.find(
                            (item: { code: string; score?: number; finalScore?: number }) =>
                              item.code.toLowerCase().includes('productiv')
                          );
                          return `${p?.score ?? p?.finalScore ?? 0}%`;
                        },
                      },
                      {
                        accessorKey: 'attendance',
                        header: PERFORMANCE_LABELS.DETAIL.HISTORY.ATTENDANCE,
                        cell: ({ row }) => {
                          const p = row.original.pillars?.find(
                            (item: { code: string; score?: number; finalScore?: number }) =>
                              item.code.toLowerCase().includes('attend')
                          );
                          return `${p?.score ?? p?.finalScore ?? 0}%`;
                        },
                      },
                      {
                        accessorKey: 'quality',
                        header: PERFORMANCE_LABELS.DETAIL.HISTORY.QUALITY,
                        cell: ({ row }) => {
                          const p = row.original.pillars?.find(
                            (item: { code: string; score?: number; finalScore?: number }) =>
                              item.code.toLowerCase().includes('quality')
                          );
                          return `${p?.score ?? p?.finalScore ?? 0}%`;
                        },
                      },
                      {
                        accessorKey: 'score',
                        header: PERFORMANCE_LABELS.DETAIL.HISTORY.FINAL_SCORE,
                        cell: ({ row }) => {
                          const s = row.original.totalScore ?? row.original.score ?? 0;
                          return `${s}%`;
                        },
                      },
                      {
                        accessorKey: 'grade',
                        header: PERFORMANCE_LABELS.DETAIL.HISTORY.GRADE,
                        cell: ({ row }) => {
                          const g =
                            row.original.grade?.code ??
                            row.original.grade?.name ??
                            row.original.grade?.grade;
                          return g ? <Badge variant="secondary">{g}</Badge> : '-';
                        },
                      },
                      {
                        id: 'action',
                        header: PERFORMANCE_LABELS.DETAIL.HISTORY.ACTION,
                        cell: ({ row }) => (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedHistoryRecord(row.original)}
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                          </Button>
                        ),
                      },
                    ]}
                    data={historyRecords}
                    isLoading={isLoadingHistory}
                  />
                </div>
              ),
            },
            {
              key: 'violations',
              label: PERFORMANCE_LABELS.DETAIL.TABS.HISTORY_VIOLATIONS,
              content: (
                <div className="mt-4 space-y-4">
                  <div className="max-w-sm">
                    <SearchBar
                      value=""
                      onChange={() => {}}
                      placeholder={PERFORMANCE_LABELS.DETAIL.SEARCH.PLACEHOLDER}
                      width="100%"
                    />
                  </div>
                  <DataTable<ProjectHistory, unknown>
                    columns={[
                      {
                        accessorKey: 'name',
                        header: PERFORMANCE_LABELS.DETAIL.PROJECTS.PROJECT_NAME,
                        cell: ({ row }) => (
                          <span className="font-semibold">
                            {row.original.name ?? row.original.projectName ?? '-'}
                          </span>
                        ),
                      },
                      {
                        accessorKey: 'periodStart',
                        header: PERFORMANCE_LABELS.DETAIL.PROJECTS.START_DATE,
                        cell: ({ row }) =>
                          row.original.periodStart ?? row.original.startDate ?? '-',
                      },
                      {
                        accessorKey: 'periodEnd',
                        header: PERFORMANCE_LABELS.DETAIL.PROJECTS.END_DATE,
                        cell: ({ row }) => row.original.periodEnd ?? row.original.endDate ?? '-',
                      },
                      {
                        accessorKey: 'workerCount',
                        header: PERFORMANCE_LABELS.DETAIL.PROJECTS.WORKER,
                        cell: ({ row }) => row.original.workerCount ?? '-',
                      },
                      {
                        accessorKey: 'score',
                        header: PERFORMANCE_LABELS.DETAIL.PROJECTS.SCORE,
                        cell: ({ row }) =>
                          row.original.score ?? row.original.performanceScore ?? '-',
                      },
                      {
                        accessorKey: 'grade',
                        header: PERFORMANCE_LABELS.LIST.COLUMNS.GRADE,
                        cell: ({ row }) => {
                          const g = row.original.grade?.code ?? row.original.grade?.name;
                          return g ? <Badge variant="secondary">{g}</Badge> : '-';
                        },
                      },
                      {
                        accessorKey: 'status',
                        header: PERFORMANCE_LABELS.DETAIL.PROJECTS.STATUS,
                        cell: ({ row }) => (
                          <Badge variant="outline" className="capitalize">
                            {row.original.status?.replace('_', ' ') ?? '-'}
                          </Badge>
                        ),
                      },
                    ]}
                    data={violationRecords}
                    isLoading={isLoadingViolations}
                  />
                </div>
              ),
            },
            {
              key: 'projects',
              label: PERFORMANCE_LABELS.DETAIL.TABS.PROJECTS,
              content: (
                <div className="mt-4 space-y-4">
                  <div className="max-w-sm">
                    <SearchBar
                      value=""
                      onChange={() => {}}
                      placeholder={PERFORMANCE_LABELS.DETAIL.SEARCH.PLACEHOLDER}
                      width="100%"
                    />
                  </div>
                  <DataTable<ProjectHistory, unknown>
                    columns={[
                      {
                        accessorKey: 'name',
                        header: PERFORMANCE_LABELS.DETAIL.PROJECTS.PROJECT_NAME,
                        cell: ({ row }) => (
                          <span className="font-semibold">
                            {row.original.name ?? row.original.projectName ?? '-'}
                          </span>
                        ),
                      },
                      {
                        accessorKey: 'periodStart',
                        header: PERFORMANCE_LABELS.DETAIL.PROJECTS.START_DATE,
                        cell: ({ row }) =>
                          row.original.periodStart ?? row.original.startDate ?? '-',
                      },
                      {
                        accessorKey: 'periodEnd',
                        header: PERFORMANCE_LABELS.DETAIL.PROJECTS.END_DATE,
                        cell: ({ row }) => row.original.periodEnd ?? row.original.endDate ?? '-',
                      },
                      {
                        accessorKey: 'workerCount',
                        header: PERFORMANCE_LABELS.DETAIL.PROJECTS.WORKER,
                        cell: ({ row }) => row.original.workerCount ?? '-',
                      },
                      {
                        accessorKey: 'score',
                        header: PERFORMANCE_LABELS.DETAIL.PROJECTS.SCORE,
                        cell: ({ row }) =>
                          row.original.score ?? row.original.performanceScore ?? '-',
                      },
                      {
                        accessorKey: 'grade',
                        header: PERFORMANCE_LABELS.LIST.COLUMNS.GRADE,
                        cell: ({ row }) => {
                          const g = row.original.grade?.code ?? row.original.grade?.name;
                          return g ? <Badge variant="secondary">{g}</Badge> : '-';
                        },
                      },
                      {
                        accessorKey: 'status',
                        header: PERFORMANCE_LABELS.DETAIL.PROJECTS.STATUS,
                        cell: ({ row }) => (
                          <Badge variant="outline" className="capitalize">
                            {row.original.status?.replace('_', ' ') ?? '-'}
                          </Badge>
                        ),
                      },
                      {
                        id: 'action',
                        header: PERFORMANCE_LABELS.DETAIL.HISTORY.ACTION,
                        cell: ({ row }) => (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedProjectRecord(row.original)}
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                          </Button>
                        ),
                      },
                    ]}
                    data={projectRecords}
                    isLoading={isLoadingProjects}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal Dialog 1: History Penilaian Detail (Gambar 1) */}
      <Dialog
        open={selectedHistoryRecord !== null}
        onOpenChange={(open) => !open && setSelectedHistoryRecord(null)}
      >
        <DialogContent className="max-h-[90vh] w-full sm:max-w-lg overflow-y-auto p-6">
          <DialogHeader className="pb-4 border-b border-slate-200">
            <DialogTitle className="text-lg font-bold text-slate-900">
              {PERFORMANCE_LABELS.DETAIL.MODAL.DETAIL_TITLE}
            </DialogTitle>
          </DialogHeader>

          {selectedHistoryRecord && historyDetailData && (
            <div className="mt-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white border border-slate-200">
                  {employeeInitials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {historyDetailData.employee?.name ?? employee?.name ?? 'Karyawan'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {historyDetailData.employee?.position ?? employee?.position ?? 'Staff Produksi'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {historyDetailData.employee?.code} · {historyDetailData.employee?.employeeGrade}
                  </p>
                </div>
              </div>

              {/* Pillars Cards - Dynamic render from API */}
              <div className="space-y-3">
                {historyDetailData.pillars?.map((pillar) => {
                  const pillarKey = pillar.code.toLowerCase();
                  const isExpanded = expandedPillars[pillarKey] ?? false;

                  return (
                    <div
                      key={pillar.code}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => togglePillar(pillarKey)}
                        className="flex w-full items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {pillarKey.includes('productiv') && (
                            <LineChart className="h-4 w-4 text-slate-500" />
                          )}
                          {pillarKey.includes('attend') && (
                            <Calendar className="h-4 w-4 text-slate-500" />
                          )}
                          {pillarKey.includes('quality') && (
                            <Star className="h-4 w-4 text-amber-500" />
                          )}
                          {pillarKey.includes('violation') && (
                            <User className="h-4 w-4 text-rose-500" />
                          )}
                          <span className="text-sm font-bold text-slate-900">{pillar.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {pillar.score ?? pillar.finalScore ?? 0}%
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                      </button>
                      {isExpanded && pillar.components && pillar.components.length > 0 && (
                        <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
                          {pillar.components.map((component) => (
                            <div key={component.id} className="flex items-start justify-between">
                              <div className="flex items-start gap-2">
                                <span
                                  className={`mt-1.5 h-2 w-2 rounded-full ${
                                    pillarKey.includes('quality') ? 'bg-amber-500' : 'bg-teal-500'
                                  }`}
                                />
                                <div>
                                  <p className="text-xs font-semibold text-slate-900">
                                    {component.name}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    skor komponen {component.percentage ?? 0}%
                                    {component.description && ` · ${component.description}`}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-emerald-600">
                                {component.value ?? 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Summary Card Banner Modal */}
              {(() => {
                const modalGradeCode =
                  historyDetailData.grade?.code ?? historyDetailData.grade?.name ?? 'E';
                const modalGradeKey =
                  (modalGradeCode.toUpperCase() as keyof typeof GRADE_THEMES) in GRADE_THEMES
                    ? (modalGradeCode.toUpperCase() as keyof typeof GRADE_THEMES)
                    : 'E';
                const modalTheme = GRADE_THEMES[modalGradeKey];
                const modalTotalScore =
                  historyDetailData.totalScore ?? historyDetailData.score ?? 0;
                const modalMinVal =
                  historyDetailData.grade?.minValue ?? historyDetailData.grade?.minScore ?? 0;
                const modalMaxVal =
                  historyDetailData.grade?.maxValue ?? historyDetailData.grade?.maxScore ?? 100;
                const modalRewards = historyDetailData.rewards ?? [];
                const modalPunishments = historyDetailData.punishments ?? [];

                return (
                  <div className={`rounded-xl border p-4 shadow-2xs ${modalTheme.cardBg}`}>
                    <div className="flex items-center gap-2">
                      <Badge className={modalTheme.badgeBg}>
                        {PERFORMANCE_LABELS.DETAIL.CARDS.FINAL_RESULT}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${modalTheme.circleBg}`}
                      >
                        {modalGradeCode}
                      </span>
                      <div>
                        <h4 className={`text-base font-bold ${modalTheme.titleText}`}>
                          {PERFORMANCE_LABELS.LIST.COLUMNS.GRADE} {modalGradeCode}
                        </h4>
                        <p className={`text-xs font-medium ${modalTheme.subText}`}>
                          {PERFORMANCE_LABELS.DETAIL.CARDS.TOTAL_SCORE} {modalTotalScore}% ·{' '}
                          {PERFORMANCE_LABELS.DETAIL.CARDS.SCORE_RANGE} {modalMinVal}–{modalMaxVal}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`mt-4 space-y-3 border-t pt-3 ${modalTheme.cardBg.includes('emerald') ? 'border-emerald-200/60' : 'border-slate-200'}`}
                    >
                      <div>
                        <div
                          className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${modalTheme.headerText}`}
                        >
                          <Gift className="h-3.5 w-3.5" />
                          <span>{PERFORMANCE_LABELS.DETAIL.REWARDS.LABEL}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {modalRewards.length > 0 ? (
                            modalRewards.map((r) => (
                              <span
                                key={r.id}
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${modalTheme.rewardPill}`}
                              >
                                {r.name ?? r.code ?? r.title}
                              </span>
                            ))
                          ) : (
                            <p className="text-xs text-slate-600">
                              {PERFORMANCE_LABELS.DETAIL.REWARDS.NO_REWARD}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <div
                          className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${modalTheme.headerText}`}
                        >
                          <User className="h-3.5 w-3.5" />
                          <span>{PERFORMANCE_LABELS.DETAIL.PUNISHMENTS.LABEL}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {modalPunishments.length > 0 ? (
                            modalPunishments.map((p) => (
                              <span
                                key={p.id}
                                className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-800"
                              >
                                {p.name ?? p.code ?? p.title}
                              </span>
                            ))
                          ) : (
                            <p className="text-xs text-slate-600">
                              {PERFORMANCE_LABELS.DETAIL.PUNISHMENTS.NO_PUNISHMENT}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setSelectedHistoryRecord(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Dialog 2: History Project Detail (Gambar 2) */}
      <Dialog
        open={selectedProjectRecord !== null}
        onOpenChange={(open) => !open && setSelectedProjectRecord(null)}
      >
        <DialogContent className="max-h-[90vh] w-full sm:max-w-lg overflow-y-auto p-6">
          <DialogHeader className="pb-4 border-b border-slate-200">
            <DialogTitle className="text-lg font-bold text-slate-900">Detail</DialogTitle>
          </DialogHeader>

          {selectedProjectRecord && (
            <div className="mt-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white border border-slate-200">
                  {employeeInitials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {projectDetailData?.employee?.name ?? employee?.name ?? 'Karyawan'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {projectDetailData?.employee?.position ??
                      employee?.position ??
                      'Staff Produksi'}
                  </p>
                </div>
              </div>

              {/* Main Score Card Project */}
              {(() => {
                const projScore =
                  projectDetailData?.totalScore ??
                  projectDetailData?.score ??
                  selectedProjectRecord.score ??
                  0;
                const projGradeCode =
                  projectDetailData?.grade?.code ??
                  projectDetailData?.grade?.name ??
                  selectedProjectRecord.grade?.code ??
                  selectedProjectRecord.grade?.name ??
                  'E';
                const projGradeKey =
                  (projGradeCode.toUpperCase() as keyof typeof GRADE_THEMES) in GRADE_THEMES
                    ? (projGradeCode.toUpperCase() as keyof typeof GRADE_THEMES)
                    : 'E';
                const projTheme = GRADE_THEMES[projGradeKey];
                const projMinVal = projectDetailData?.grade?.minValue ?? 0;
                const projMaxVal = projectDetailData?.grade?.maxValue ?? 100;

                return (
                  <div
                    className={`rounded-2xl border p-5 shadow-2xs space-y-4 ${projTheme.cardBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">
                        {selectedProjectRecord.name ??
                          selectedProjectRecord.projectName ??
                          'Proyek A'}
                      </h3>
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none">
                        {selectedProjectRecord.status === 'completed'
                          ? 'Selesai'
                          : (selectedProjectRecord.status?.replace('_', ' ') ?? 'Selesai')}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500">
                      Periode{' '}
                      {selectedProjectRecord.periodStart ?? selectedProjectRecord.period ?? 'Juli'}{' '}
                      - {selectedProjectRecord.periodEnd ?? ''}
                    </p>

                    <div className="flex items-center gap-4 pt-1">
                      <span
                        className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-extrabold ${projTheme.circleBg}`}
                      >
                        {projScore}%
                      </span>
                      <div>
                        <h2
                          className={`text-xl font-extrabold tracking-wide ${projTheme.titleText}`}
                        >
                          GRADE {projGradeCode}
                        </h2>
                        <p className={`text-xs font-medium ${projTheme.subText}`}>
                          Total skor {projScore}% · masuk rentang {projMinVal}–{projMaxVal}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Pillars Accordion List */}
              <div className="space-y-3">
                {(projectDetailData?.pillars ?? []).map((pillar) => {
                  const pillarKey = pillar.code.toLowerCase();
                  const isExpanded = expandedPillars[pillarKey] ?? true;

                  return (
                    <div
                      key={pillar.code}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => togglePillar(pillarKey)}
                        className="flex w-full items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {pillarKey.includes('productiv') && (
                            <LineChart className="h-4 w-4 text-slate-500" />
                          )}
                          {pillarKey.includes('attend') && (
                            <Calendar className="h-4 w-4 text-slate-500" />
                          )}
                          {pillarKey.includes('quality') && (
                            <Star className="h-4 w-4 text-amber-500" />
                          )}
                          {pillarKey.includes('violation') && (
                            <User className="h-4 w-4 text-rose-500" />
                          )}
                          <span className="text-sm font-bold text-slate-900">{pillar.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {pillar.score ?? pillar.finalScore ?? 0}%
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                      </button>
                      {isExpanded && pillar.components && pillar.components.length > 0 && (
                        <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
                          {pillar.components.map((component) => (
                            <div key={component.code} className="flex items-start justify-between">
                              <div className="flex items-start gap-2">
                                <span
                                  className={`mt-1.5 h-2 w-2 rounded-full ${
                                    pillarKey.includes('quality') ? 'bg-amber-500' : 'bg-teal-500'
                                  }`}
                                />
                                <div>
                                  <p className="text-xs font-semibold text-slate-900">
                                    {component.name}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    skor komponen {component.score ?? 0}% · bobot{' '}
                                    {component.weight ?? 0}%
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-emerald-600">
                                {component.finalScore ?? 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setSelectedProjectRecord(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
