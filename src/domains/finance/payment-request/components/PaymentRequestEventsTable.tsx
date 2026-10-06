'use client';

import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, EllipsisVertical, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { toast } from '@/shared/lib/toast';
import { PAYMENT_REQUEST_LABELS } from '../constants';
import { useDeletePaymentEvent } from '../hooks/use-delete-payment-event';
import { useMarkClearedEvent } from '../hooks/use-mark-cleared-event';
import { PAYMENT_REQUEST_QUERY_KEYS } from '../hooks/use-payment-requests';
import type { PaymentRequestEvent } from '../types';
import { PAYMENT_REQUEST_EVENT_STATUS_LABELS } from '../types';

interface PaymentRequestEventsTableProps {
  events: PaymentRequestEvent[];
  paymentRequestId: string;
}

type ActionType = 'mark_cleared' | 'delete' | null;

interface ConfirmState {
  action: ActionType;
  eventId: string | null;
}

export function PaymentRequestEventsTable({
  events,
  paymentRequestId,
}: PaymentRequestEventsTableProps) {
  const labels = PAYMENT_REQUEST_LABELS.DETAIL;
  const queryClient = useQueryClient();

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    action: null,
    eventId: null,
  });

  const { mutateAsync: markClearedMutation, isPending: isMarkClearedPending } =
    useMarkClearedEvent(paymentRequestId);
  const { mutateAsync: deleteEventMutation, isPending: isDeletePending } =
    useDeletePaymentEvent(paymentRequestId);

  const handleMarkCleared = useCallback(async () => {
    if (!confirmState.eventId) return;

    try {
      await markClearedMutation(confirmState.eventId);
      toast.success({ title: 'Event marked as cleared' });
      queryClient.invalidateQueries({ queryKey: PAYMENT_REQUEST_QUERY_KEYS.all });
      setConfirmState({ action: null, eventId: null });
    } catch (error: any) {
      toast.error({
        title: 'Gagal mark cleared',
        description: error?.message || 'Terjadi kesalahan',
      });
    }
  }, [confirmState.eventId, markClearedMutation, queryClient]);

  const handleDeleteEvent = useCallback(async () => {
    if (!confirmState.eventId) return;

    try {
      await deleteEventMutation(confirmState.eventId);
      toast.success({ title: 'Event dihapus' });
      queryClient.invalidateQueries({ queryKey: PAYMENT_REQUEST_QUERY_KEYS.all });
      setConfirmState({ action: null, eventId: null });
    } catch (error: any) {
      toast.error({
        title: 'Gagal menghapus',
        description: error?.message || 'Terjadi kesalahan',
      });
    }
  }, [confirmState.eventId, deleteEventMutation, queryClient]);

  const openConfirmDialog = (action: ActionType, eventId: string) => {
    setConfirmState({ action, eventId });
  };

  const closeConfirmDialog = () => {
    setConfirmState({ action: null, eventId: null });
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-slate-700">{labels.EVENTS}</h3>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead>Paid At</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-slate-500">
                    No events
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-sm font-medium">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(event.amount)}
                    </TableCell>
                    <TableCell className="text-sm">{event.paymentMethodLabel}</TableCell>
                    <TableCell className="text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          event.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : event.status === 'pending_clearance'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {PAYMENT_REQUEST_EVENT_STATUS_LABELS[event.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{event.paidByName}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {new Date(event.paidAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-slate-600">
                      {event.notes ?? '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0">
                            <EllipsisVertical className="h-4 w-4 text-slate-950" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {event.canMarkCleared && event.status === 'pending_clearance' && (
                            <DropdownMenuItem
                              onClick={() => openConfirmDialog('mark_cleared', event.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Cleared
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => openConfirmDialog('delete', event.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mark Cleared Confirmation */}
      <ConfirmDialog
        open={confirmState.action === 'mark_cleared'}
        onOpenChange={(open) => !open && closeConfirmDialog()}
        variant="success"
        title="Konfirmasi Mark Cleared"
        description="Apakah Anda yakin ingin menandai event pembayaran ini sebagai cleared?"
        cancelText="Batal"
        confirmText="Ya, Mark Cleared"
        onCancel={closeConfirmDialog}
        onConfirm={handleMarkCleared}
        isLoading={isMarkClearedPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmState.action === 'delete'}
        onOpenChange={(open) => !open && closeConfirmDialog()}
        variant="danger"
        title="Konfirmasi Hapus Event"
        description="Apakah Anda yakin ingin menghapus event pembayaran ini? Tindakan ini tidak dapat dibatalkan."
        cancelText="Batal"
        confirmText="Ya, Hapus"
        onCancel={closeConfirmDialog}
        onConfirm={handleDeleteEvent}
        isLoading={isDeletePending}
      />
    </>
  );
}
