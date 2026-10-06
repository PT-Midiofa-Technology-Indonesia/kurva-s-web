import type { Row } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { BOQDetailRow } from '@/domains/project-control/types/boq-detail';
import { formatIDR } from '@/shared/utils/currency';
import { BOQDetail } from './BOQDetail';

// `formatIDR` inserts a non-breaking space (U+00A0) between the currency symbol and the
// digits. `@testing-library/dom`'s default text matcher normalizes the *rendered* DOM text
// (collapsing that NBSP to a regular space) but does NOT normalize the string passed to
// `getByText`, so a raw `screen.getByText(formatIDR(x))` never matches. Normalize the
// expectation the same way before asserting.
function amountText(value: number): string {
  return formatIDR(value).replace(/ /g, ' ');
}

const rows: BOQDetailRow[] = [
  {
    id: 'r1',
    code: 'A.1',
    name: 'Pekerjaan Pondasi',
    jenis: 'Job',
    isFinalLevel: true,
    volumeRab: 10,
    volumeCco: 12,
    volumeActual: 8,
    uomName: 'm3',
    amountRab: 1_000_000,
    amountCco: 1_200_000,
    amountActual: 900_000,
    viewCostCount: 2,
    children: [],
  },
];

describe('BOQDetail', () => {
  describe('showSingleAmount = false (grouped amount columns — only RAB)', () => {
    it('renders only the RAB amount value', () => {
      render(<BOQDetail value={rows} showSingleAmount={false} />);

      expect(screen.getByText(amountText(1_000_000))).toBeInTheDocument();
      expect(screen.queryByText(amountText(1_200_000))).not.toBeInTheDocument();
      expect(screen.queryByText(amountText(900_000))).not.toBeInTheDocument();
    });

    it('renders RAB only as Amount column header, not extra CCO/ACT', () => {
      render(<BOQDetail value={rows} showSingleAmount={false} />);

      // 'RAB' appears twice: once as Volume sub-header, once as Amount sub-header.
      expect(screen.getAllByText('RAB').length).toBe(2);
      // CCO/ACT only appear once each (from Volume group, not Amount).
      expect(screen.getAllByText('CCO').length).toBe(1);
      expect(screen.getAllByText('ACT').length).toBe(1);
      expect(screen.getByText('Amount')).toBeInTheDocument();
    });
  });

  describe('showSingleAmount = true (default — single flat amount column)', () => {
    it('shows only the RAB amount value, not CCO/ACT', () => {
      render(<BOQDetail value={rows} />);

      expect(screen.getByText(amountText(1_000_000))).toBeInTheDocument();
      expect(screen.queryByText(amountText(1_200_000))).not.toBeInTheDocument();
      expect(screen.queryByText(amountText(900_000))).not.toBeInTheDocument();
    });

    it('does not render a second CCO/ACT header for the amount section', () => {
      render(<BOQDetail value={rows} showSingleAmount />);

      // Only the Volume group contributes a 'CCO'/'ACT' header now.
      expect(screen.getAllByText('CCO').length).toBe(1);
      expect(screen.getAllByText('ACT').length).toBe(1);
    });
  });

  describe('contextMenu prop', () => {
    it('renders the table normally when contextMenu is provided', () => {
      const contextMenu = vi.fn((_row: Row<BOQDetailRow>) => <div>Menu Action</div>);
      render(<BOQDetail value={rows} contextMenu={contextMenu} />);

      expect(screen.getByText('Pekerjaan Pondasi')).toBeInTheDocument();
    });

    it('renders the table normally when contextMenu is omitted', () => {
      render(<BOQDetail value={rows} />);

      expect(screen.getByText('Pekerjaan Pondasi')).toBeInTheDocument();
    });

    it('forwards contextMenu through to the underlying DataTable, which invokes it per row', () => {
      const contextMenu = vi.fn((_row: Row<BOQDetailRow>) => <div>Menu Action</div>);
      render(<BOQDetail value={rows} contextMenu={contextMenu} />);

      expect(contextMenu).toHaveBeenCalled();
      const [calledRow] = contextMenu.mock.calls[0];
      expect(calledRow.original.id).toBe('r1');
    });
  });
});
