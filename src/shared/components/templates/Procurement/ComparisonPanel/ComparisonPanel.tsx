'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Trash2, Upload } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { DataTable } from '@/components/organisms/DataTable';
import type { HeaderColumnNode } from '@/components/organisms/DataTable/DataTable';

/* ── Types ─────────────────────────────────────────────────── */

export interface PriceCell {
  unitPrice: number;
  totalPrice: number;
}

export interface BoQRow {
  id: string;
  no: number;
  material: string;
  volPo: number;
  uom: string;
  boqFinal: PriceCell;
  boqCco: PriceCell;
}

export interface VendorColumnDef {
  id: string;
  label: string;
}

export interface ComparisonPanelProps {
  rows: BoQRow[];
  vendorColumns?: VendorColumnDef[];
  /** Called when vendor header icon clicked — parent opens modal/dialog */
  onVendorAction?: (vendorId: string) => void;
  /** Called when remove vendor icon clicked */
  onRemoveVendor?: (vendorId: string) => void;
  /** Vendor price data: vendorId -> PriceCell[] per row index */
  vendorData?: Record<string, PriceCell[]>;
  /** Called when vendor price cell edited */
  onVendorDataChange?: (vendorId: string, prices: PriceCell[]) => void;
}

/* ── Flat row type for DataTable ──────────────────────────── */

type VendorKey = `vendor_${string}_unitPrice` | `vendor_${string}_totalPrice`;

interface FlatRow {
  id: string;
  no: number;
  material: string;
  volPo: number;
  uom: string;
  boqFinalUnitPrice: number;
  boqFinalTotalPrice: number;
  boqCcoUnitPrice: number;
  boqCcoTotalPrice: number;
  [key: VendorKey]: number;
}

/* ── Helpers ───────────────────────────────────────────────── */

function calcTotal(price: number, qty: number): number {
  return price * qty;
}

function formatNum(v: number): string {
  return v.toLocaleString('id-ID');
}

/* ── Component ─────────────────────────────────────────────── */

export function ComparisonPanel({
  rows,
  vendorColumns = [],
  onVendorAction,
  onRemoveVendor,
  vendorData = {},
  onVendorDataChange,
}: ComparisonPanelProps) {
  const hasVendors = vendorColumns.length > 0;

  /* ── Flatten data ── */
  const flatData = useMemo<FlatRow[]>(() => {
    return rows.map((r) => {
      const base: FlatRow = {
        id: r.id,
        no: r.no,
        material: r.material,
        volPo: r.volPo,
        uom: r.uom,
        boqFinalUnitPrice: r.boqFinal.unitPrice,
        boqFinalTotalPrice: r.boqFinal.totalPrice,
        boqCcoUnitPrice: r.boqCco.unitPrice,
        boqCcoTotalPrice: r.boqCco.totalPrice,
      };
      for (const vc of vendorColumns) {
        const cell = vendorData[vc.id]?.[rows.indexOf(r)];
        base[`vendor_${vc.id}_unitPrice` as VendorKey] = cell?.unitPrice ?? 0;
        base[`vendor_${vc.id}_totalPrice` as VendorKey] = cell?.totalPrice ?? 0;
      }
      return base;
    });
  }, [rows, vendorColumns, vendorData]);

  /* ── Columns ── */
  const columns = useMemo<ColumnDef<FlatRow>[]>(() => {
    const cols: ColumnDef<FlatRow>[] = [
      {
        id: 'no',
        accessorFn: (r) => r.no,
        header: 'No',
        size: 40,
        enableSorting: false,
        enableResizing: false,
        footer: () => <span className="font-semibold text-brand-600">Amount</span>,
      },
      {
        id: 'material',
        accessorFn: (r) => r.material,
        header: 'Material/Tools',
        size: 200,
        enableSorting: false,
      },
      {
        id: 'volPo',
        accessorFn: (r) => r.volPo,
        header: 'VOL PO',
        size: 72,
        enableSorting: false,
      },
      {
        id: 'uom',
        accessorFn: (r) => r.uom,
        header: 'UoM',
        size: 60,
        enableSorting: false,
      },
      {
        id: 'boqFinalUnitPrice',
        accessorFn: (r) => r.boqFinalUnitPrice,
        header: 'Unit Price',
        size: 100,
        enableSorting: false,
        cell: ({ getValue }) => formatNum(getValue<number>()),
      },
      {
        id: 'boqFinalTotalPrice',
        accessorFn: (r) => r.boqFinalTotalPrice,
        header: 'Total Price',
        size: 110,
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="font-medium">{formatNum(getValue<number>())}</span>
        ),
        footer: ({ table }) => {
          const total = table
            .getCoreRowModel()
            .rows.reduce((s, r) => s + (r.getValue('boqFinalTotalPrice') as number), 0);
          return <span className="font-bold">{formatNum(total)}</span>;
        },
      },
      {
        id: 'boqCcoUnitPrice',
        accessorFn: (r) => r.boqCcoUnitPrice,
        header: 'Unit Price',
        size: 100,
        enableSorting: false,
        cell: ({ getValue }) => formatNum(getValue<number>()),
      },
      {
        id: 'boqCcoTotalPrice',
        accessorFn: (r) => r.boqCcoTotalPrice,
        header: 'Total Price',
        size: 110,
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="font-medium">{formatNum(getValue<number>())}</span>
        ),
        footer: ({ table }) => {
          const total = table
            .getCoreRowModel()
            .rows.reduce((s, r) => s + (r.getValue('boqCcoTotalPrice') as number), 0);
          return <span className="font-bold">{formatNum(total)}</span>;
        },
      },
    ];

    // Vendor columns
    for (const vc of vendorColumns) {
      cols.push({
        id: `vendor_${vc.id}_unitPrice`,
        accessorFn: (r) => r[`vendor_${vc.id}_unitPrice` as VendorKey] ?? 0,
        header: 'Unit Price',
        size: 100,
        enableSorting: false,
        meta: { editable: true },
        cell: ({ getValue }) => formatNum(getValue<number>()),
      });
      cols.push({
        id: `vendor_${vc.id}_totalPrice`,
        accessorFn: (r) => r[`vendor_${vc.id}_totalPrice` as VendorKey] ?? 0,
        header: 'Total Price',
        size: 110,
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="font-medium">{formatNum(getValue<number>())}</span>
        ),
        footer: ({ table }) => {
          const colId = `vendor_${vc.id}_totalPrice`;
          const total = table
            .getCoreRowModel()
            .rows.reduce((s, r) => s + (r.getValue(colId) as number), 0);
          return <span className="font-bold">{formatNum(total)}</span>;
        },
      });
    }

    return cols;
  }, [vendorColumns]);

  /* ── Header column tree ── */
  const headerColumnTree = useMemo<HeaderColumnNode[]>(() => {
    const tree: HeaderColumnNode[] = [
      { id: 'no', header: 'No' },
      { id: 'material', header: 'Material/Tools' },
      { id: 'volPo', header: 'VOL PO' },
      { id: 'uom', header: 'UoM' },
      {
        id: 'boqFinalGroup',
        header: 'BoQ Final',
        children: [
          { id: 'boqFinalUnitPrice', header: 'Unit Price' },
          { id: 'boqFinalTotalPrice', header: 'Total Price' },
        ],
      },
      {
        id: 'boqCcoGroup',
        header: 'BoQ CCO',
        children: [
          { id: 'boqCcoUnitPrice', header: 'Unit Price' },
          { id: 'boqCcoTotalPrice', header: 'Total Price' },
        ],
      },
    ];

    for (const vc of vendorColumns) {
      tree.push({
        id: `vendor_${vc.id}_group`,
        header: (
          <div className="flex items-center justify-center gap-1.5">
            <span>{vc.label}</span>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded hover:bg-brand-500 p-0.5 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onVendorAction?.(vc.id);
              }}
              title="Upload"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded hover:bg-red-500 p-0.5 transition-colors text-red-400 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveVendor?.(vc.id);
              }}
              title="Hapus vendor"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
        className: 'bg-brand-50 text-center text-xs font-semibold',
        children: [
          {
            id: `vendor_${vc.id}_unitPrice`,
            header: 'Unit Price',
            className: 'bg-brand-50 text-brand-700',
          },
          {
            id: `vendor_${vc.id}_totalPrice`,
            header: 'Total Price',
            className: 'bg-brand-50 text-brand-700',
          },
        ],
      });
    }

    return tree;
  }, [vendorColumns, onVendorAction, onRemoveVendor]);

  /* ── Cell edit handler ── */
  const handleCellEdit = useCallback(
    (rowIndex: number, columnId: string, value: unknown, _row?: FlatRow) => {
      const numVal =
        typeof value === 'string' ? parseFloat(value.replace(/[^0-9]/g, '')) : Number(value);
      const validNum = Number.isNaN(numVal) ? 0 : numVal;

      // Vendor columns
      const vendorUnitMatch = columnId.match(/^vendor_(.+)_unitPrice$/);
      if (vendorUnitMatch) {
        const vid = vendorUnitMatch[1];
        const current = vendorData[vid] ?? [];
        const prices = current.map((p, i) =>
          i === rowIndex
            ? { unitPrice: validNum, totalPrice: calcTotal(validNum, rows[rowIndex].volPo) }
            : p
        );
        while (prices.length < rows.length) prices.push({ unitPrice: 0, totalPrice: 0 });
        onVendorDataChange?.(vid, prices);
        return;
      }
    },
    [rows, vendorData, onVendorDataChange]
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
      <DataTable<FlatRow, unknown>
        columns={columns}
        data={flatData}
        headerColumnTree={hasVendors ? headerColumnTree : headerColumnTree}
        getRowId={(r) => r.id}
        enablePagination={false}
        enableColumnDnd={false}
        enableColumnResize={false}
        enableRowDnd={false}
        enableZebraStripes={true}
        enableFooter={true}
        onCellEdit={handleCellEdit}
        stickyHeader={false}
        className="w-full"
      />
    </div>
  );
}

export default ComparisonPanel;
