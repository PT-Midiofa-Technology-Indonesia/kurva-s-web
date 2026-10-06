'use client';

import { Pencil } from 'lucide-react';
import { Button } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules';
import type { PaymentMethod, PoPreview, PoTax } from '../types/po-finalize';
import { PoTaxSection } from './PoTaxSection';

export interface PoCardProps {
  po: PoPreview;
  onAddPayment: (vendorId: string) => void;
  onEditWarehouse: (vendorId: string) => void;
  onDueDateChange: (vendorId: string, date: string) => void;
  onViewPayment: (vendorId: string, paymentMethod: PaymentMethod) => void;
  onDeletePayment?: (vendorId: string, paymentMethodId: string) => void;
  onAddTax: (vendorId: string, tax: PoTax) => void;
  onRemoveTax: (vendorId: string, taxTypeId: string) => void;
  isReadOnly?: boolean;
}

function formatNum(v: number) {
  return v.toLocaleString('id-ID');
}

export function PoCard({
  po,
  onAddPayment: _onAddPayment,
  onEditWarehouse,
  onDueDateChange,
  onViewPayment: _onViewPayment,
  onDeletePayment: _onDeletePayment,
  onAddTax,
  onRemoveTax,
  isReadOnly = false,
}: PoCardProps) {
  const total = po.items.reduce((s, i) => s + i.totalPrice, 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      {/* Temporary: hide payment action in PPP finalize until payment flow is restored. */}
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-xs text-slate-500">
          Payment method sementara disembunyikan di step finalize.
        </p>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Due Date */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Due Date<span className="text-brand-600">*</span>
          </label>
          <div className="w-72">
            <DatePicker
              value={po.dueDate ? new Date(po.dueDate) : undefined}
              onChange={(v) => {
                const d = v && !('from' in v) ? v : null;
                onDueDateChange(po.vendorId, d ? d.toISOString().slice(0, 10) : '');
              }}
              placeholder="Pilih Due Date"
              disabledState={isReadOnly}
            />
          </div>
        </div>

        {/* Ship from / to */}
        <div className="grid grid-cols-2 gap-4">
          {/* Pengiriman dari */}
          <div className="rounded-lg border border-slate-200 p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500">Pengiriman dari</p>
            <div className="space-y-1">
              <p className="text-xs text-slate-400">Nama Vendor</p>
              <p className="text-sm font-medium text-slate-800">{po.vendorName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400">Alamat Vendor</p>
              <p className="text-sm text-slate-700">{po.vendorAddress}</p>
            </div>
          </div>

          {/* Pengiriman ke */}
          <div className="rounded-lg border border-slate-200 p-4 space-y-2 relative">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">Pengiriman ke</p>
              {!isReadOnly && po.warehouseId && (
                <button
                  type="button"
                  onClick={() => onEditWarehouse(po.vendorId)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {po.warehouseId ? (
              <>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Nama Warehouse</p>
                  <p className="text-sm font-medium text-slate-800">{po.warehouseName}</p>
                </div>
                {po.warehouseAddress && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Alamat Warehouse</p>
                    <p className="text-sm text-slate-700">{po.warehouseAddress}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                  <p className="text-xs font-semibold text-amber-700">Keterangan</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Project belum punya destination warehouse!
                  </p>
                </div>
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 text-white"
                    onClick={() => onEditWarehouse(po.vendorId)}
                  >
                    Set Warehouse
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Temporary: hide payment list in PPP finalize until payment flow is restored.
        {po.paymentMethods.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Informasi Payment Method ({po.paymentMethods.length})
            </p>
            <table className="w-full text-sm rounded-lg border border-slate-200 overflow-hidden">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                    Payment Method
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                    Jenis
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {po.paymentMethods.map((pm) => (
                  <tr key={pm.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5 text-slate-800">Metode Pembayaran {pm.order}</td>
                    <td className="px-4 py-2.5 text-slate-600">{pm.paymentTypeLabel}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-600"
                          onClick={() => onViewPayment(po.vendorId, pm)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!isReadOnly && (
                          <>
                            <button
                              type="button"
                              className="text-slate-400 hover:text-slate-600"
                              onClick={() => onAddPayment(po.vendorId)}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            {onDeletePayment && (
                              <button
                                type="button"
                                className="text-slate-400 hover:text-red-600"
                                onClick={() => onDeletePayment(po.vendorId, pm.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        */}

        {/* Items table */}
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Item</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">
                  VOL PO
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">
                  Unit Price
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">
                  Total Price
                </th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-4 py-2.5 text-slate-800">{item.name}</td>
                  <td className="px-4 py-2.5 text-right text-slate-700">
                    {item.volPo} {item.uom}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-700">
                    {formatNum(item.unitPrice)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-700">
                    {formatNum(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={3} className="px-4 py-2.5 text-xs font-semibold text-slate-500">
                  Amount
                </td>
                <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                  {formatNum(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <PoTaxSection
          taxes={po.taxes}
          baseAmount={total}
          costBreakdown={po.costBreakdown}
          onAddTax={(tax) => onAddTax(po.vendorId, tax)}
          onRemoveTax={(taxTypeId) => onRemoveTax(po.vendorId, taxTypeId)}
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  );
}
