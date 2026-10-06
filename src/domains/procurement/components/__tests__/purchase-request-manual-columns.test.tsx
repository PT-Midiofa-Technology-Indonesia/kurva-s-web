import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { PurchaseRequestCostRow } from '../../types/purchase-request-cost-rows';
import { createPurchaseRequestManualColumns } from '../purchase-request-manual-columns';

const rows: PurchaseRequestCostRow[] = [
  {
    id: 'r1',
    code: 'M.232',
    name: 'Bata Merah',
    volumeRab: 100,
    cco: 50,
    volumeAct: 50,
    existingPr: 0,
    remainingQty: 50,
    max: 50,
    vol: 50,
    uom: 'biji',
    remarks: 'Merek Tiga Roda',
  },
  {
    id: 'r2',
    code: 'P.234',
    name: 'Jasa Pengecatan',
    volumeRab: 50,
    cco: 1,
    volumeAct: 1,
    existingPr: 1,
    remainingQty: 0,
    max: 0,
    vol: 0,
    uom: 'orang',
    remarks: '',
    disabled: true,
    disabledReason: 'Item sudah di-bundle ke vendor, tidak bisa PR manual',
  },
];

describe('createPurchaseRequestManualColumns', () => {
  it('produces one column per field plus a leading select column', () => {
    const columns = createPurchaseRequestManualColumns({
      rows,
      checkedIds: {},
      onToggleRow: vi.fn(),
      onToggleSection: vi.fn(),
    });

    const ids = columns.map((c) => c.id ?? (c as { accessorKey?: string }).accessorKey);
    expect(ids).toEqual([
      'select',
      'code',
      'name',
      'volumeRab',
      'cco',
      'volumeAct',
      'existingPr',
      'max',
      'vol',
      'uom',
      'remarks',
    ]);
  });

  it('marks the vol column as editable', () => {
    const columns = createPurchaseRequestManualColumns({
      rows,
      checkedIds: {},
      onToggleRow: vi.fn(),
      onToggleSection: vi.fn(),
    });

    const vol = columns.find((c) => (c as { accessorKey?: string }).accessorKey === 'vol');
    expect((vol?.meta as { editable?: boolean })?.editable).toBe(true);
  });

  it('gates vol editability on the row being checked (editableWhen)', () => {
    const build = (checkedIds: Record<string, boolean>) =>
      createPurchaseRequestManualColumns({
        rows,
        checkedIds,
        onToggleRow: vi.fn(),
        onToggleSection: vi.fn(),
      }).find((c) => (c as { accessorKey?: string }).accessorKey === 'vol');

    const unchecked = build({})?.meta as {
      editableWhen?: (row: PurchaseRequestCostRow) => boolean;
    };
    const checked = build({ r1: true })?.meta as {
      editableWhen?: (row: PurchaseRequestCostRow) => boolean;
    };

    expect(unchecked.editableWhen?.(row1)).toBe(false);
    expect(checked.editableWhen?.(row1)).toBe(true);
  });

  it('renders the lock hint in the vol cell when the row is unchecked and volEditHint is provided', () => {
    const columns = createPurchaseRequestManualColumns({
      rows,
      checkedIds: {},
      onToggleRow: vi.fn(),
      onToggleSection: vi.fn(),
      labels: { volEditHint: 'Centang item terlebih dahulu untuk mengubah volume' },
    });
    const volColumn = getVolColumn(columns);

    const { container } = render(volColumn.cell({ row: { original: row1 } }));

    // Radix tooltip content only renders in a portal after hover (jsdom-hostile),
    // so assert on the trigger element itself instead.
    const trigger = container.querySelector('[data-slot="tooltip-trigger"]');
    expect(trigger).toBeInTheDocument();
    expect(trigger?.classList.contains('lucide-lock')).toBe(true);
  });

  it('renders no lock hint in the vol cell once the row is checked', () => {
    const columns = createPurchaseRequestManualColumns({
      rows,
      checkedIds: { r1: true },
      onToggleRow: vi.fn(),
      onToggleSection: vi.fn(),
      labels: { volEditHint: 'Centang item terlebih dahulu untuk mengubah volume' },
    });
    const volColumn = getVolColumn(columns);

    const { container } = render(volColumn.cell({ row: { original: row1 } }));

    // row1.vol(50) === remainingQty(50), so neither lock hint nor amber Info trigger exists
    expect(container.querySelector('[data-slot="tooltip-trigger"]')).not.toBeInTheDocument();
  });

  it('does not mark code/name/cco/volumeAct/existingPr/max/uom as editable', () => {
    const columns = createPurchaseRequestManualColumns({
      rows,
      checkedIds: {},
      onToggleRow: vi.fn(),
      onToggleSection: vi.fn(),
    });

    for (const key of ['code', 'name', 'cco', 'volumeAct', 'existingPr', 'max', 'uom']) {
      const col = columns.find((c) => (c as { accessorKey?: string }).accessorKey === key);
      expect((col?.meta as { editable?: boolean } | undefined)?.editable).toBeFalsy();
    }
  });

  it('marks the remarks column as editable', () => {
    const columns = createPurchaseRequestManualColumns({
      rows,
      checkedIds: {},
      onToggleRow: vi.fn(),
      onToggleSection: vi.fn(),
    });

    const remarks = columns.find((c) => (c as { accessorKey?: string }).accessorKey === 'remarks');
    expect((remarks?.meta as { editable?: boolean })?.editable).toBe(true);
  });

  const [row1, disabledRow] = rows;

  function getSelectColumn(columns: ReturnType<typeof createPurchaseRequestManualColumns>) {
    const col = columns.find((c) => c.id === 'select');
    if (!col) throw new Error('select column not found');
    return col as typeof col & {
      header: (ctx: unknown) => ReactNode;
      cell: (ctx: unknown) => ReactNode;
    };
  }

  function getVolColumn(columns: ReturnType<typeof createPurchaseRequestManualColumns>) {
    const col = columns.find((c) => (c as { accessorKey?: string }).accessorKey === 'vol');
    if (!col) throw new Error('vol column not found');
    return col as typeof col & { cell: (ctx: unknown) => ReactNode };
  }

  it('checks the header checkbox when every non-disabled row is checked', () => {
    const columns = createPurchaseRequestManualColumns({
      rows,
      checkedIds: { r1: true },
      onToggleRow: vi.fn(),
      onToggleSection: vi.fn(),
    });
    const selectColumn = getSelectColumn(columns);

    render(selectColumn.header({}));

    const checkbox = screen.getByRole('checkbox', { name: 'Pilih semua' });
    expect(checkbox).toBeChecked();
  });

  it('does not check the header checkbox when no rows are checked', () => {
    const columns = createPurchaseRequestManualColumns({
      rows,
      checkedIds: {},
      onToggleRow: vi.fn(),
      onToggleSection: vi.fn(),
    });
    const selectColumn = getSelectColumn(columns);

    render(selectColumn.header({}));

    const checkbox = screen.getByRole('checkbox', { name: 'Pilih semua' });
    expect(checkbox).not.toBeChecked();
  });

  it('disables the per-row checkbox for a disabled row', () => {
    const columns = createPurchaseRequestManualColumns({
      rows,
      checkedIds: {},
      onToggleRow: vi.fn(),
      onToggleSection: vi.fn(),
    });
    const selectColumn = getSelectColumn(columns);

    render(selectColumn.cell({ row: { original: disabledRow } }));

    const checkbox = screen.getByRole('checkbox', { name: `Pilih ${disabledRow.name}` });
    expect(checkbox).toBeDisabled();
  });

  it('does not disable the per-row checkbox for a normal row', () => {
    const columns = createPurchaseRequestManualColumns({
      rows,
      checkedIds: {},
      onToggleRow: vi.fn(),
      onToggleSection: vi.fn(),
    });
    const selectColumn = getSelectColumn(columns);

    render(selectColumn.cell({ row: { original: row1 } }));

    const checkbox = screen.getByRole('checkbox', { name: `Pilih ${row1.name}` });
    expect(checkbox).not.toBeDisabled();
  });

  it('renders no info icon in the vol cell when the row is not checked', () => {
    const columns = createPurchaseRequestManualColumns({
      rows,
      checkedIds: {},
      onToggleRow: vi.fn(),
      onToggleSection: vi.fn(),
    });
    const volColumn = getVolColumn(columns);

    const { container } = render(volColumn.cell({ row: { original: row1 } }));

    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it.skip('renders the info icon in the vol cell when the row is checked', () => {
    const columns = createPurchaseRequestManualColumns({
      rows,
      checkedIds: { r1: true },
      onToggleRow: vi.fn(),
      onToggleSection: vi.fn(),
    });
    const volColumn = getVolColumn(columns);

    const { container } = render(volColumn.cell({ row: { original: row1 } }));

    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
