'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import { DataTable } from '@/shared/components/organisms/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { formatDateLong as formatDate } from '@/shared/utils/format';
import { BULK_ATTENDANCE_LABELS } from '../constants';
import { useBulkPrepare } from '../hooks/use-bulk-prepare';
import { useBulkSubmit } from '../hooks/use-bulk-submit';
import { useCalculateAttendanceStatus } from '../hooks/use-calculate-attendance-status';
import type {
  AttendanceStatus,
  BulkAttendanceItem,
  BulkAttendancePayloadItem,
  CalculateAttendanceStatusPayload,
} from '../types';

const LABELS = BULK_ATTENDANCE_LABELS;

const STATUS_OPTIONS = ['present', 'late', 'absent', 'sick', 'leave', 'dayoff', 'halfday'] as const;

const PER_PAGE = 20;

interface EditableRow {
  original: BulkAttendanceItem;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
}

export function BulkAttendancePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const companyId = searchParams.get('companyId');
  const date = searchParams.get('date') ?? '';

  const { data, isLoading, isError } = useBulkPrepare(date, companyId);
  const submitMutation = useBulkSubmit(companyId);
  const calculateStatusMutation = useCalculateAttendanceStatus(companyId);

  const [rows, setRows] = useState<EditableRow[]>([]);
  const [displayCount, setDisplayCount] = useState(PER_PAGE);

  // Sync API data → editable rows on load
  useEffect(() => {
    if (data?.data) {
      setRows(
        data.data.map((item) => ({
          original: item,
          checkIn: item.checkIn ?? '',
          checkOut: item.checkOut ?? '',
          status: item.status,
        }))
      );
    }
  }, [data]);

  // Reset display count when rows data changes (new date, refetch, etc.)
  useEffect(() => {
    setDisplayCount(PER_PAGE);
  }, []);

  const visibleData = useMemo(() => rows.slice(0, displayCount), [rows, displayCount]);
  const hasMore = displayCount < rows.length;

  const existingCount = useMemo(
    () => rows.filter((r) => r.original.hasExistingRecord).length,
    [rows]
  );

  // Ref-based handler so columns don't get stale closures
  const cellChangeRef = useRef(
    (index: number, field: 'checkIn' | 'checkOut' | 'status', value: string) => {
      setRows((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    }
  );

  // Client-side infinite scroll: load next page
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const handleLoadMore = useCallback(() => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    // Yield to next frame so DataTable can process the sentinel disconnect
    requestAnimationFrame(() => {
      setDisplayCount((prev) => Math.min(prev + PER_PAGE, rows.length));
      setIsFetchingMore(false);
    });
  }, [hasMore, isFetchingMore, rows.length]);

  const handleCellChange = useCallback(
    (index: number, field: 'checkIn' | 'checkOut' | 'status', value: string) => {
      if (field === 'status' && ['sick', 'leave', 'dayoff', 'absent'].includes(value)) {
        setRows((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], status: value, checkIn: '', checkOut: '' };
          return next;
        });
        return;
      }

      cellChangeRef.current(index, field, value);

      // Auto-calculate status for checkIn/checkOut changes
      if (field === 'checkIn' || field === 'checkOut') {
        const row = rows[index];
        const checkIn = field === 'checkIn' ? value : row.checkIn;
        const checkOut = field === 'checkOut' ? value : row.checkOut;

        // Only calculate if both checkIn and checkOut are provided
        if (checkIn && checkOut) {
          const payload: CalculateAttendanceStatusPayload = {
            employeeId: row.original.employeeId,
            checkIn,
            checkOut,
          };

          calculateStatusMutation.mutate(payload, {
            onSuccess: (data) => {
              setRows((prev) => {
                const next = [...prev];
                next[index] = {
                  ...next[index],
                  status: data.status,
                };
                return next;
              });
            },
          });
        }
      }
    },
    [rows, calculateStatusMutation]
  );

  const handleSubmit = async () => {
    const payload: BulkAttendancePayloadItem[] = rows.map((row) => {
      const isNoTimeStatus = ['sick', 'leave', 'dayoff', 'absent'].includes(row.status);
      return {
        employeeId: row.original.employeeId,
        attendanceDate: row.original.attendanceDate,
        checkIn: isNoTimeStatus || !row.checkIn ? null : row.checkIn,
        checkOut: isNoTimeStatus || !row.checkOut ? null : row.checkOut,
        status: row.status as AttendanceStatus,
        locationType: row.original.locationType,
        locationId: row.original.locationId,
        projectId: row.original.projectId ?? row.original.project?.id ?? null,
        workHour: null,
        timezone: 'WIB',
        notes: null,
        checkInLatitude: null,
        checkInLongitude: null,
        checkInDistanceMeters: null,
        checkOutLatitude: null,
        checkOutLongitude: null,
        checkOutDistanceMeters: null,
      };
    });

    try {
      await submitMutation.mutateAsync({ attendances: payload });
      router.push('/human-resource/attendance');
    } catch {
      // toast already shown by useBulkSubmit's onError
    }
  };

  const columns = useMemo<ColumnDef<EditableRow>[]>(
    () => [
      {
        id: 'attendanceDate',
        header: LABELS.COLUMNS.DATE,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-slate-700">{formatDate(row.original.original.attendanceDate)}</span>
        ),
      },
      {
        id: 'employeeCode',
        header: LABELS.COLUMNS.CODE,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="underline underline-offset-2 cursor-pointer text-slate-900">
            {row.original.original.employeeCode}
          </span>
        ),
      },
      {
        id: 'employeeName',
        header: LABELS.COLUMNS.NAME,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <span className="text-slate-900">{row.original.original.employeeName}</span>
            {row.original.original.hasExistingRecord && (
              <Badge
                variant="outline"
                className="text-amber-700 border-amber-300 bg-amber-50 text-[10px] px-1.5 py-0 font-normal"
              >
                {LABELS.EXISTING_BADGE}
              </Badge>
            )}
          </span>
        ),
      },
      {
        id: 'checkIn',
        header: LABELS.COLUMNS.CHECK_IN,
        enableSorting: false,
        cell: ({ row }) => (
          <input
            type="time"
            value={row.original.checkIn ?? ''}
            onChange={(e) => handleCellChange(row.index, 'checkIn', e.target.value)}
            className="w-28 rounded border border-slate-200 px-2 py-1 text-sm focus:border-teal-500 focus:outline-none"
          />
        ),
      },
      {
        id: 'checkOut',
        header: LABELS.COLUMNS.CHECK_OUT,
        enableSorting: false,
        cell: ({ row }) => (
          <input
            type="time"
            value={row.original.checkOut ?? ''}
            onChange={(e) => handleCellChange(row.index, 'checkOut', e.target.value)}
            className="w-28 rounded border border-slate-200 px-2 py-1 text-sm focus:border-teal-500 focus:outline-none"
          />
        ),
      },
      {
        id: 'location',
        header: LABELS.COLUMNS.LOCATION,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-slate-500">{row.original.original.locationName ?? '-'}</span>
        ),
      },
      {
        id: 'project',
        header: LABELS.COLUMNS.PROJECT,
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original.original;
          const projectName = item.project?.name ?? item.projectName ?? null;
          return (
            <span className={projectName ? 'text-slate-700' : 'text-slate-400'}>
              {projectName ?? '-'}
            </span>
          );
        },
      },
      {
        id: 'status',
        header: LABELS.COLUMNS.STATUS,
        enableSorting: false,
        cell: ({ row }) => (
          <select
            value={row.original.status}
            onChange={(e) => handleCellChange(row.index, 'status', e.target.value)}
            className="w-28 rounded border border-slate-200 px-2 py-1 text-sm focus:border-teal-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        ),
      },
    ],
    [handleCellChange]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        <span className="ml-2 text-slate-500">{LABELS.LOADING}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-600">{LABELS.ERROR}</p>
      </div>
    );
  }

  if (!date) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">{LABELS.NO_DATE}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-slate-950">{LABELS.PAGE_TITLE}</h1>
          <span className="text-sm text-slate-400">{formatDate(date)}</span>
          {existingCount > 0 && (
            <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
              {existingCount} {LABELS.EXISTING_COUNT}
            </span>
          )}
        </div>
        <Button onClick={handleSubmit} disabled={submitMutation.isPending || rows.length === 0}>
          {submitMutation.isPending ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              {LABELS.BUTTON_SUBMITTING}
            </>
          ) : (
            LABELS.BUTTON_SUBMIT
          )}
        </Button>
      </div>
      {/* Table card */}
      <div className="flex-1 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <DataTable<EditableRow, unknown>
          columns={columns}
          data={visibleData}
          enableInfiniteScroll
          hasNextPage={hasMore}
          onLoadMore={handleLoadMore}
          isFetchingNextPage={isFetchingMore}
          enableZebraStripes
          enableColumnDnd={false}
          enableColumnResize={false}
          enableRowSelection={false}
          enableFooter={false}
          enableRangeSelection={false}
          emptyMessage={LABELS.EMPTY}
          className="shadow-none rounded-none border-0"
        />
      </div>
    </div>
  );
}
