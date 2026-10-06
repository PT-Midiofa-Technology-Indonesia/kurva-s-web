'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { AsyncSelect, type SelectValue } from '@/shared/components/atoms';
import { Calendar, type CalendarEvent } from '@/shared/components/molecules';
import { Badge, Button, Skeleton } from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { usePaymentRequestStatuses } from '@/shared/hooks/use-enums';
import type { CalendarDayItem } from '../api/get-calendar';
import { PaymentScheduleDrawer } from '../components/PaymentScheduleDrawer';
import { PAYMENT_REQUEST_LABELS } from '../constants';
import { usePaymentRequestCalendar } from '../hooks/use-payment-request-calendar';

interface PaymentSchedulePageProps {
  companyId?: string;
}

function CalendarSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>

      <div className="grid grid-cols-7 border-y border-slate-200 bg-white">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={`calendar-skeleton-header-${index}`} className="px-2 py-3">
            <Skeleton className="mx-auto h-4 w-8 rounded-md" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-white">
        {Array.from({ length: 35 }, (_, index) => {
          const isLastColumn = (index + 1) % 7 === 0;
          const isLastRow = index >= 28;

          return (
            <div
              key={`calendar-skeleton-cell-${index}`}
              className={[
                'flex min-h-30.5 flex-col gap-2 p-2',
                !isLastColumn ? 'border-r border-slate-200' : '',
                !isLastRow ? 'border-b border-slate-200' : '',
              ].join(' ')}
            >
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-5 w-full rounded-md" />
              <Skeleton className="h-5 w-5/6 rounded-md" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getStatusColor(item: CalendarDayItem): CalendarEvent['color'] {
  if (item.sourceType === 'purchase_order') return 'pink';
  if (item.sourceType === 'cost_request' && item.status === 'paid') return 'green';
  if (item.sourceType === 'cost_request') return 'red';
  if (item.sourceType === 'payroll') return 'yellow';

  switch (item.status) {
    case 'paid':
      return 'green';
    case 'rejected':
      return 'red';
    case 'pending':
      return 'yellow';
    default:
      return 'gray';
  }
}

function getSourceLabel(sourceType: string): string {
  return (
    PAYMENT_REQUEST_LABELS.SCHEDULE.SOURCE_TYPE_LABELS[
      sourceType as keyof typeof PAYMENT_REQUEST_LABELS.SCHEDULE.SOURCE_TYPE_LABELS
    ] ?? sourceType
  );
}

export function PaymentSchedulePage(_: PaymentSchedulePageProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { companyId } = useCompanyFilter();
  const { data: statusOptions = [] } = usePaymentRequestStatuses();

  const { data: calendarDays = [], isLoading } = usePaymentRequestCalendar({
    year: currentMonth.getFullYear(),
    date: currentMonth.getMonth() + 1,
    status: statusFilter,
    companyId,
  });

  const events = useMemo<CalendarEvent[]>(() => {
    return calendarDays.flatMap((day) =>
      day.items.map((item) => ({
        id: item.id,
        date: item.dueDate,
        label: `${getSourceLabel(item.sourceType)}: ${item.code || '-'}`,
        color: getStatusColor(item),
        meta: item,
      }))
    );
  }, [calendarDays]);

  const totalCount = useMemo(
    () => calendarDays.reduce((sum, day) => sum + day.totalCount, 0),
    [calendarDays]
  );

  const handleStatusChange = useCallback((value: SelectValue) => {
    const status = Array.isArray(value) ? value[0] : value;
    setStatusFilter(status ? (status as string) : undefined);
  }, []);

  const handleDateClick = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    const item = event.meta as CalendarDayItem;
    setSelectedDate(item.dueDate);
  }, []);

  const handleMonthChange = useCallback((date: Date) => {
    setCurrentMonth(date);
  }, []);

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => router.push('/finance/payment-requests')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-slate-950">
          {PAYMENT_REQUEST_LABELS.SCHEDULE.TITLE}
        </h1>
      </div>

      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <Calendar
          currentDate={currentMonth}
          selectedDate={selectedDate}
          showOutsideDays
          events={events}
          maxVisible={2}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
          onMonthChange={handleMonthChange}
          labels={{
            today: PAYMENT_REQUEST_LABELS.SCHEDULE.TODAY,
            more: PAYMENT_REQUEST_LABELS.SCHEDULE.MORE,
          }}
          headerMeta={
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
              {totalCount} {PAYMENT_REQUEST_LABELS.SCHEDULE.PAYMENT_REQUESTS_SUFFIX}
            </Badge>
          }
          headerActions={
            <AsyncSelect
              className="w-40"
              options={statusOptions}
              placeholder={PAYMENT_REQUEST_LABELS.SCHEDULE.ALL_STATUS}
              isSearchable={false}
              onChange={handleStatusChange}
              isClearable
            />
          }
        />
      )}

      {selectedDate && companyId && (
        <PaymentScheduleDrawer
          open={!!selectedDate}
          date={selectedDate}
          companyId={companyId}
          onClose={() => setSelectedDate(null)}
          onPaymentClick={(paymentRequestId: string) => {
            setSelectedDate(null);
            router.push(`/finance/payment-requests/${paymentRequestId}`);
          }}
        />
      )}
    </div>
  );
}
