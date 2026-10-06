import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { BOQCostSection } from '../types/boq-cost.types';
import type { BOQNode } from '../types/boq-tree.types';
import { BOQTemplateCostDialog } from './BOQTemplateCostDialog';

const node: BOQNode = {
  id: 'n1',
  name: 'Pekerjaan Bangunan Office',
  jenis: 'Job',
  bobot: 1,
  children: [],
};

function Harness({ initial }: { initial: BOQCostSection[] }) {
  const [sections, setSections] = useState(initial);
  return (
    <BOQTemplateCostDialog
      node={node}
      open
      onOpenChange={() => {}}
      sections={sections}
      onSectionRowsChange={(value, rows) =>
        setSections((prev) => prev.map((s) => (s.value === value ? { ...s, rows } : s)))
      }
    />
  );
}

const baseSections: BOQCostSection[] = [
  {
    value: 'material_cost',
    label: 'Material Cost',
    rows: [{ id: 'r1', code: 'M.232', name: 'Bata Merah' }],
  },
  {
    value: 'transport_cost',
    label: 'Transport Cost',
    disabled: true,
    rows: [{ id: 'r2', code: 'M.233', name: 'Pasir' }],
  },
];

describe('BOQTemplateCostDialog', () => {
  it('renders the node name as the title', () => {
    render(<Harness initial={baseSections} />);
    expect(screen.getByText('Pekerjaan Bangunan Office')).toBeInTheDocument();
  });

  it('renders a section per cost type with its default name header', () => {
    render(<Harness initial={baseSections} />);
    expect(screen.getByText('Material Cost')).toBeInTheDocument();
    expect(screen.getByText('Transport Cost')).toBeInTheDocument();
    expect(screen.getAllByText('Nama Material').length).toBeGreaterThan(0);
  });

  it('appends an empty row when Tambah is clicked', () => {
    render(<Harness initial={baseSections} />);
    const materialSection = screen.getByTestId('cost-section-material_cost');
    const sectionHelper = within(materialSection);
    const before = sectionHelper.getAllByRole('row').length;
    const tambah = sectionHelper.getAllByRole('button', { name: /tambah/i })[0];
    fireEvent.click(tambah);
    expect(within(materialSection).getAllByRole('row').length).toBe(before + 1);
  });

  it('disables the Tambah button for a locked section', () => {
    render(<Harness initial={baseSections} />);
    const transport = screen.getByTestId('cost-section-transport_cost');
    const tambah = within(transport).getByRole('button', { name: /tambah/i });
    expect(tambah).toBeDisabled();
  });

  it('renders without error when a section has nameCombobox config', () => {
    const sectionsWithCombobox: BOQCostSection[] = [
      {
        value: 'material_cost',
        label: 'Material Cost',
        rows: [{ id: 'r1', code: 'M.001', name: 'Bata Merah' }],
        nameCombobox: {
          options: ['Bata Merah', 'Semen Portland'],
          onSearch: vi.fn(),
          onScrollEnd: vi.fn(),
        },
      },
    ];
    render(
      <BOQTemplateCostDialog
        node={node}
        open
        onOpenChange={() => {}}
        sections={sectionsWithCombobox}
        onSectionRowsChange={() => {}}
      />
    );
    expect(screen.getByText('Material Cost')).toBeInTheDocument();
    expect(screen.getByText('Bata Merah')).toBeInTheDocument();
  });

  it('renders a badge instead of Tambah button when infoBadge is set', () => {
    const sectionsWithBadge: BOQCostSection[] = [
      {
        value: 'transport_cost',
        label: 'Transport Cost',
        disabled: true,
        infoBadge: { message: 'Data transport otomatis dibuat setelah menyimpan' },
        rows: [],
      },
    ];
    render(
      <BOQTemplateCostDialog
        node={node}
        open
        onOpenChange={() => {}}
        sections={sectionsWithBadge}
        onSectionRowsChange={() => {}}
      />
    );
    expect(
      screen.getByText('Data transport otomatis dibuat setelah menyimpan')
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /tambah/i })).not.toBeInTheDocument();
  });

  it('renders without error when a section has nameAsyncSelect config', () => {
    const sectionsWithAsyncSelect: BOQCostSection[] = [
      {
        value: 'material_cost',
        label: 'Material Cost',
        rows: [{ id: 'r1', code: 'M.001', name: 'Bata Merah', catalogId: 'cat1' }],
        nameAsyncSelect: {
          options: [{ value: 'cat1', label: 'M.001 - Bata Merah' }],
          onSearch: vi.fn(),
          onScrollEnd: vi.fn(),
          getItemById: (id) => (id === 'cat1' ? { code: 'M.001', name: 'Bata Merah' } : undefined),
        },
      },
    ];
    render(
      <BOQTemplateCostDialog
        node={node}
        open
        onOpenChange={() => {}}
        sections={sectionsWithAsyncSelect}
        onSectionRowsChange={() => {}}
      />
    );
    expect(screen.getByText('Material Cost')).toBeInTheDocument();
    expect(screen.getByText('Bata Merah')).toBeInTheDocument();
  });
});
