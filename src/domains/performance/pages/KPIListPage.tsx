'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Settings, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { MonthYearPicker } from '@/shared/components/molecules/MonthYearPicker';
import { SearchBar } from '@/shared/components/molecules/SearchBar';
import { DataTable } from '@/shared/components/organisms/DataTable';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/shared/components/ui';
import { GRADE_THEMES, PERFORMANCE_LABELS, PILAR_CODES } from '../constants';
import { usePerformanceGrades, usePerformancePage } from '../hooks';
import type { PerformanceEmployee } from '../types';

function getPillarValue(employee: PerformanceEmployee, code: string): number {
  const pillar =
    employee.pillars?.find((item) => item.code === code) ??
    employee.performance?.pillars?.find((item) => item.code === code);

  return pillar?.score ?? pillar?.percentage ?? 0;
}

function getFinalScore(employee: PerformanceEmployee): number | undefined {
  return employee.totalScore ?? employee.performance?.score;
}

function getGradeName(employee: PerformanceEmployee): string | undefined {
  return (
    employee.grade?.name ??
    employee.grade?.code ??
    employee.performance?.grade?.name ??
    employee.performance?.grade?.grade
  );
}

type PeriodMode = 'month' | 'year';

export function KPIListPage() {
  const router = useRouter();
  const {
    data,
    isLoading,
    error,
    params,
    companyId,
    companyOptions,
    handleCompanyChange,
    setQueryParams,
  } = usePerformancePage();
  const gradesQuery = usePerformanceGrades({ companyId });

  const [periodMode, setPeriodMode] = useState<PeriodMode>(() =>
    params.month === undefined && params.year !== undefined ? 'year' : 'month'
  );

  useEffect(() => {
    if (params.month === undefined && params.year !== undefined) {
      setPeriodMode('year');
    } else if (params.month !== undefined) {
      setPeriodMode('month');
    }
  }, [params.month, params.year]);

  const handlePeriodModeChange = (mode: PeriodMode) => {
    setPeriodMode(mode);
    setQueryParams({
      month: mode === 'year' ? undefined : (params.month ?? new Date().getMonth() + 1),
      year: params.year ?? new Date().getFullYear(),
      page: 1,
    });
  };

  const handlePeriodChange = (date: Date) => {
    setQueryParams({
      month: periodMode === 'month' ? date.getMonth() + 1 : undefined,
      year: date.getFullYear(),
      page: 1,
    });
  };

  // Handle search
  const handleSearchChange = (value: string) => {
    setQueryParams({
      search: value || undefined,
      page: 1,
    });
  };

  // Current period for MonthYearPicker
  const currentPeriod = useMemo(() => {
    const year = params.year ?? new Date().getFullYear();
    const month = params.month ?? (params.year === undefined ? new Date().getMonth() + 1 : 1);
    return new Date(year, month - 1, 1);
  }, [params.month, params.year]);

  const gradeOptions = useMemo(() => {
    const list =
      gradesQuery.data?.data?.map((g) => ({
        label: `${PERFORMANCE_LABELS.LIST.COLUMNS.GRADE} ${g.name}`,
        value: g.id,
      })) ?? [];
    return list;
  }, [gradesQuery.data]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 4 }, (_, index) => currentYear - index);
  }, []);

  const handleYearChange = (year: string) => {
    setQueryParams({
      month: undefined,
      year: Number(year),
      page: 1,
    });
  };

  // DataTable columns
  const columns = useMemo<ColumnDef<PerformanceEmployee>[]>(
    () => [
      {
        accessorKey: 'name',
        header: PERFORMANCE_LABELS.LIST.COLUMNS.NAME,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.employeeId}</span>
          </div>
        ),
      },
      {
        accessorKey: 'position',
        header: PERFORMANCE_LABELS.LIST.COLUMNS.POSITION,
        cell: ({ row }) => row.original.position ?? '-',
      },
      {
        id: 'productivity',
        header: PERFORMANCE_LABELS.LIST.COLUMNS.PRODUCTIVITY,
        cell: ({ row }) => {
          const value = getPillarValue(row.original, PILAR_CODES.PRODUCTIVITY);
          return <span>{value.toFixed(0)}%</span>;
        },
      },
      {
        id: 'attendance',
        header: PERFORMANCE_LABELS.LIST.COLUMNS.ATTENDANCE,
        cell: ({ row }) => {
          const value = getPillarValue(row.original, PILAR_CODES.ATTENDANCE);
          return <span>{value.toFixed(0)}%</span>;
        },
      },
      {
        id: 'quality',
        header: PERFORMANCE_LABELS.LIST.COLUMNS.QUALITY,
        cell: ({ row }) => {
          const value = getPillarValue(row.original, PILAR_CODES.WORK_QUALITY);
          return <span>{value.toFixed(0)}%</span>;
        },
      },
      {
        accessorKey: 'score',
        header: PERFORMANCE_LABELS.LIST.COLUMNS.FINAL_SCORE,
        cell: ({ row }) => {
          const score = getFinalScore(row.original);
          return (
            <span className="font-semibold">{score != null ? `${score.toFixed(0)}%` : '-'}</span>
          );
        },
      },
      {
        accessorKey: 'grade',
        header: PERFORMANCE_LABELS.LIST.COLUMNS.GRADE,
        cell: ({ row }) => {
          const grade = getGradeName(row.original);
          if (!grade) return <span className="text-slate-400">-</span>;
          const bgClass =
            GRADE_THEMES[grade as keyof typeof GRADE_THEMES]?.badgeBg ??
            'bg-slate-600 hover:bg-slate-600 text-white';
          return (
            <Badge className={`min-w-8 justify-center rounded-md ${bgClass}`} variant="secondary">
              {grade}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: PERFORMANCE_LABELS.LIST.COLUMNS.ACTION,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const monthParam = params.month ? `month=${params.month}` : '';
              const yearParam = params.year ? `year=${params.year}` : '';
              const queryString = [monthParam, yearParam].filter(Boolean).join('&');
              const url = `/human-resource/kpi/${row.original.id}${queryString ? `?${queryString}` : ''}`;
              router.push(url);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
          </Button>
        ),
      },
    ],
    [params.month, params.year, router]
  );

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Gagal memuat data KPI karyawan'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const employees = data?.data.employees ?? [];
  const summary = data?.data.summary;
  const gradeDistribution = summary?.gradeDistribution ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{PERFORMANCE_LABELS.LIST.TITLE}</h1>
          <p className="text-sm text-muted-foreground">{PERFORMANCE_LABELS.LIST.DESCRIPTION}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-lg border bg-muted p-1">
            <Button
              size="sm"
              variant={periodMode === 'month' ? 'default' : 'ghost'}
              className="h-8"
              type="button"
              onClick={() => handlePeriodModeChange('month')}
            >
              {PERFORMANCE_LABELS.LIST.FILTERS.MONTH}
            </Button>
            <Button
              size="sm"
              variant={periodMode === 'year' ? 'default' : 'ghost'}
              className="h-8"
              type="button"
              onClick={() => handlePeriodModeChange('year')}
            >
              {PERFORMANCE_LABELS.LIST.FILTERS.YEAR}
            </Button>
          </div>
          <div className="w-full sm:w-44">
            {periodMode === 'month' ? (
              <MonthYearPicker
                value={currentPeriod}
                onChange={handlePeriodChange}
                placeholder={PERFORMANCE_LABELS.LIST.FILTERS.SELECT_PERIOD}
                className="w-full"
                toYear={2026}
              />
            ) : (
              <Select
                value={String(params.year ?? new Date().getFullYear())}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={PERFORMANCE_LABELS.LIST.FILTERS.SELECT_YEAR} />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <AsyncSelect
            className="w-full sm:w-56"
            options={companyOptions}
            value={companyId ?? null}
            onChange={handleCompanyChange}
            placeholder={PERFORMANCE_LABELS.LIST.FILTERS.COMPANY}
            isSearchable={false}
            isClearable={false}
          />
          <Button onClick={() => router.push('/human-resource/kpi/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            {PERFORMANCE_LABELS.SETTINGS.TITLE}
          </Button>
        </div>
      </div>

      {/* KPI Grade Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-8 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        summary && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(['A', 'B', 'C', 'D', 'E'] as const).map((letter) => {
              const grade = gradeDistribution.find((item) => item.grade === letter) ?? {
                grade: letter,
                count: 0,
                percentage: 0,
              };
              return (
                <Card key={grade.grade}>
                  <CardHeader className="pb-2">
                    <CardDescription>
                      {PERFORMANCE_LABELS.LIST.CARDS.KPI_GRADE} {grade.grade}
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold">{grade.count}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>{grade.percentage.toFixed(1)}%</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* DataTable */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full max-w-sm">
              <SearchBar
                value={params.search ?? ''}
                onDebounce={handleSearchChange}
                placeholder={PERFORMANCE_LABELS.LIST.SEARCH_PLACEHOLDER}
                showClear
                width="100%"
              />
            </div>
            <div className="w-full sm:w-44">
              <AsyncSelect
                className="w-full"
                options={gradeOptions}
                value={params.gradeId ?? null}
                onChange={(val) => {
                  const v = Array.isArray(val) ? val[0] : val;
                  setQueryParams({
                    gradeId: v || undefined,
                    page: 1,
                  });
                }}
                placeholder={PERFORMANCE_LABELS.LIST.FILTERS.ALL_GRADES}
                isSearchable={false}
                isClearable
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={employees}
            isLoading={isLoading}
            enablePagination
            enableZebraStripes={false}
            initialPage={Number(params.page ?? 1)}
            initialPageSize={Number(params.perPage ?? 10)}
            totalPages={meta?.lastPage ?? 1}
            totalItems={meta?.total ? Number(meta.total) : undefined}
            onPaginationChange={(page, pageSize) => {
              setQueryParams({
                page,
                perPage: pageSize,
              });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
