'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import { useCallback, useRef, useState } from 'react';
import type { BOQCostNameCombobox, BOQCostSection } from '../types/boq-cost.types';
import type { BOQNode } from '../types/boq-tree.types';
import { BOQTemplateCostDialog } from './BOQTemplateCostDialog';

const NODE: BOQNode = {
  id: 'n1',
  name: 'Pekerjaan Bangunan Office',
  jenis: 'Job',
  bobot: 10,
  children: [],
};

const SECTIONS: BOQCostSection[] = [
  {
    value: 'material_cost',
    label: 'Material Cost',
    rows: [
      { id: 'm1', code: 'M.232', name: 'Bata Merah ukuran 20x40' },
      { id: 'm2', code: 'M.233', name: 'Pasir Kali' },
      { id: 'm3', code: 'M.234', name: 'Semen 50 kg Merdeka' },
    ],
  },
  {
    value: 'equipment_cost',
    label: 'Equipment Cost',
    rows: [{ id: 'e1', code: 'E.567', name: 'Crane' }],
  },
  {
    value: 'transport_cost',
    label: 'Transport Cost',
    disabled: true,
    rows: [
      { id: 't1', code: 'M.232', name: 'Bata Merah ukuran 20x40' },
      { id: 't2', code: 'M.233', name: 'Pasir Kali' },
      { id: 't3', code: 'M.234', name: 'Semen 50 kg Merdeka' },
    ],
  },
  {
    value: 'man_power_cost',
    label: 'Manpower Cost',
    rows: [
      { id: 'p1', code: 'P.322', name: 'Tukang Bangunan level 1' },
      { id: 'p2', code: 'P.323', name: 'Helper Bangunan Level 2' },
      { id: 'p3', code: 'P.324', name: 'Mandor Bangunan level 2' },
    ],
  },
  {
    value: 'preliminery_cost',
    label: 'Preliminery Cost',
    rows: [
      { id: 'pr1', code: 'M.231', name: 'Gaji Tukang' },
      { id: 'pr2', code: 'M.232', name: 'Tiket Pesawat' },
      { id: 'pr3', code: 'M.233', name: 'Mess Karyawan' },
    ],
  },
];

const ALL_MATERIAL_OPTIONS = [
  'Bata Merah 20x40',
  'Bata Merah 10x20',
  'Bata Ringan AAC',
  'Pasir Kali',
  'Pasir Beton',
  'Pasir Halus',
  'Pasir Silika',
  'Semen 50 kg Tiga Roda',
  'Semen 50 kg Holcim',
  'Semen 50 kg Merdeka',
  'Besi Beton D10',
  'Besi Beton D12',
  'Besi Beton D16',
  'Besi Beton D19',
  'Keramik 40x40 Putih',
  'Keramik 60x60 Granit',
  'Granit 80x80',
  'Baja Ringan 0.75mm',
  'Baja Ringan 1mm',
  'Kayu Meranti 5x10',
  'Kayu Jati 5x10',
  'Cat Dinding Dulux',
  'Cat Eksterior',
  'Triplek 9mm',
  'Triplek 12mm',
  'GRC Board',
  'Gypsum Board',
  'Rockwool 50mm',
  'Kawat Beton',
  'Pipa PVC 3"',
  'Pipa PVC 4"',
  'Pipa Galvanis 2"',
];

const COMBOBOX_PAGE_SIZE = 8;

function injectCombobox(
  sections: BOQCostSection[],
  target: string,
  combobox: BOQCostNameCombobox
): BOQCostSection[] {
  return sections.map((s) => (s.value === target ? { ...s, nameCombobox: combobox } : s));
}

function Harness({ initial }: { initial: BOQCostSection[] }) {
  const [sections, setSections] = useState(initial);
  return (
    <BOQTemplateCostDialog
      node={NODE}
      open
      onOpenChange={() => {}}
      sections={sections}
      onSectionRowsChange={(value, rows) =>
        setSections((prev) => prev.map((s) => (s.value === value ? { ...s, rows } : s)))
      }
    />
  );
}

/** Material Cost name column uses a static combobox — all 32 options preloaded. */
function HarnessWithStaticCombobox({ initial }: { initial: BOQCostSection[] }) {
  const [sections, setSections] = useState(() =>
    injectCombobox(initial, 'material_cost', {
      options: ALL_MATERIAL_OPTIONS,
      onSearch: () => {},
      onScrollEnd: () => {},
      hasNextPage: false,
    })
  );
  return (
    <BOQTemplateCostDialog
      node={NODE}
      open
      onOpenChange={() => {}}
      sections={sections}
      onSectionRowsChange={(value, rows) =>
        setSections((prev) => prev.map((s) => (s.value === value ? { ...s, rows } : s)))
      }
    />
  );
}

/** Material Cost name column: 8 options loaded at a time, scroll dropdown to load more, type to filter. */
function HarnessWithPaginatedCombobox({ initial }: { initial: BOQCostSection[] }) {
  const [baseRows, setBaseRows] = useState(initial);
  const [visibleOptions, setVisibleOptions] = useState(() =>
    ALL_MATERIAL_OPTIONS.slice(0, COMBOBOX_PAGE_SIZE)
  );
  const [filteredOptions, setFilteredOptions] = useState<string[] | null>(null);
  const loadingRef = useRef(false);

  const hasNextPage =
    filteredOptions === null && visibleOptions.length < ALL_MATERIAL_OPTIONS.length;

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredOptions(null);
      return;
    }
    const q = query.toLowerCase();
    setFilteredOptions(ALL_MATERIAL_OPTIONS.filter((o) => o.toLowerCase().includes(q)));
  }, []);

  const handleScrollEnd = useCallback(() => {
    if (loadingRef.current || !hasNextPage) return;
    loadingRef.current = true;
    setTimeout(() => {
      setVisibleOptions((prev) => ALL_MATERIAL_OPTIONS.slice(0, prev.length + COMBOBOX_PAGE_SIZE));
      loadingRef.current = false;
    }, 400);
  }, [hasNextPage]);

  const combobox: BOQCostNameCombobox = {
    options: filteredOptions ?? visibleOptions,
    onSearch: handleSearch,
    onScrollEnd: handleScrollEnd,
    hasNextPage,
  };

  const sections = injectCombobox(baseRows, 'material_cost', combobox);

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Material options: {visibleOptions.length}/{ALL_MATERIAL_OPTIONS.length} loaded
        {filteredOptions !== null && ` · ${filteredOptions.length} matching search`}
        {hasNextPage && ' · scroll dropdown bottom to load more'}
      </p>
      <BOQTemplateCostDialog
        node={NODE}
        open
        onOpenChange={() => {}}
        sections={sections}
        onSectionRowsChange={(value, rows) =>
          setBaseRows((prev) => prev.map((s) => (s.value === value ? { ...s, rows } : s)))
        }
      />
    </div>
  );
}

const meta: Meta<typeof BOQTemplateCostDialog> = {
  title: 'Templates/BOQ Template/BOQTemplateCostDialog',
  component: BOQTemplateCostDialog,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof BOQTemplateCostDialog>;

/** Five cost sections, with Transport Cost locked (read-only + tooltip on Tambah). */
export const Default: Story = { render: () => <Harness initial={SECTIONS} /> };

/** All sections empty — Tambah adds the first row. */
export const Empty: Story = {
  render: () => <Harness initial={SECTIONS.map((s) => ({ ...s, disabled: false, rows: [] }))} />,
};

/** Material Cost name column uses combobox — all 32 options preloaded, click a name cell to open picker. */
export const WithCombobox: Story = {
  render: () => <HarnessWithStaticCombobox initial={SECTIONS} />,
};

/** Material Cost combobox loads 8 options at a time — scroll dropdown to fetch more, type to filter. */
export const WithComboboxPaginated: Story = {
  render: () => <HarnessWithPaginatedCombobox initial={SECTIONS} />,
};
