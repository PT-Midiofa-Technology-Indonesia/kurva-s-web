'use client';

import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Badge } from '@/shared/components/ui/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { CalendarDayItem } from '../api/get-calendar';
import { usePaymentRequestCalendarByDate } from '../hooks/use-payment-request-calendar-by-date';
import type { PaymentRequestStatus } from '../types';

interface PaymentScheduleDrawerProps {
  open: boolean;
  date: string;
  companyId?: string;
  onClose: () => void;
  onPaymentClick: (paymentRequestId: string) => void;
}

function getStatusVariant(
  status: PaymentRequestStatus
): 'default' | 'success' | 'destructive' | 'secondary' {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
    case 'approved':
    case 'processing':
      return 'secondary';
    case 'cancelled':
    case 'rejected':
      return 'destructive';
    default:
      return 'default';
  }
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  );
}

export function PaymentScheduleDrawer({
  open,
  date,
  companyId,
  onClose,
  onPaymentClick,
}: PaymentScheduleDrawerProps) {
  const { data: response, isLoading } = usePaymentRequestCalendarByDate(
    open ? date : null,
    companyId
  );
  const dayData = response?.data;

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
              {formatDateHeader(date)}
            </DrawerTitle>
            <div className="flex items-center gap-2">
              {dayData && (
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                  {dayData.totalCount} Payment Requests
                </Badge>
              )}
              <DrawerClose asChild>
                <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-3">
          {isLoading ? (
            <DrawerSkeleton />
          ) : !dayData || dayData.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <p className="text-sm">Tidak ada payment request</p>
            </div>
          ) : (
            dayData.items.map((item: CalendarDayItem) => (
              <div key={item.id} className="rounded-lg border border-slate-200">
                <Accordion type="single" collapsible>
                  <AccordionItem value={item.id} className="border-0">
                    <AccordionTrigger className="px-5 py-4">
                      <div className="flex flex-1 items-center gap-3">
                        <div className="flex flex-1 flex-col gap-1 text-left">
                          <span className="text-sm font-semibold text-slate-950">
                            {item.sourceTypeLabel}: {item.code}
                          </span>
                        </div>
                        <Badge variant={getStatusVariant(item.status)} className="shrink-0">
                          {item.statusLabel}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pt-0 pb-4">
                      <div className="flex flex-col gap-3 pt-2">
                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                          <div>
                            <span className="text-slate-500">Kode</span>
                            <p className="text-[11px] font-medium text-slate-900">{item.code}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Source</span>
                            <p className="text-[11px] font-medium text-slate-900">
                              {item.sourceTypeLabel}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500">Company</span>
                            <p className="text-[11px] font-medium text-slate-900">
                              {item.companyName}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500">Due Date</span>
                            <p className="text-[11px] font-medium text-slate-900">
                              {format(new Date(item.dueDate), 'dd MMM yyyy, HH:mm', {
                                locale: idLocale,
                              })}{' '}
                              WIB
                            </p>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                          <span className="text-[11px] text-slate-500">Amount</span>
                          <span className="text-xs font-semibold text-slate-900">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>

                        {/* Payment Detail button */}
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-slate-900 hover:bg-slate-800"
                          onClick={() => onPaymentClick(item.id)}
                        >
                          Payment Detail
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
