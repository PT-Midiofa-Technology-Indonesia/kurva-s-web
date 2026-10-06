'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BOQCostType } from '../types/boq-cost.types';
import type { BOQPlanningNode } from '../types/boq-planning.types';
import { BOQPlanningDetail } from './BOQPlanningDetail';

const leaf = (id: string, name: string): BOQPlanningNode => ({
  id,
  name,
  jenis: 'Job',
  bobot: null,
  children: [],
});

const SEED: BOQPlanningNode[] = [
  {
    id: 'a',
    name: 'Pekerjaan Bangunan Office',
    jenis: 'Job',
    bobot: 10,
    children: [
      {
        id: 'a1',
        name: 'Pekerjaan Civil',
        jenis: 'Job',
        bobot: 10,
        children: [
          {
            id: 'a11',
            name: 'Area Lobby',
            jenis: 'Location',
            bobot: 2,
            children: [
              {
                id: 'a111',
                name: 'Pemasangan Batu Bata',
                jenis: 'Job',
                bobot: 2,
                children: [
                  { ...leaf('a1111', 'Pengadukan Semen & Pasir'), detailsFilledCount: 3 },
                  { ...leaf('a1112', 'Pemasangan Granit'), detailsFilledCount: 5 },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const MOCK_NAME_OPTIONS = [
  'Pekerjaan Bangunan Office',
  'Pekerjaan Civil',
  'Pekerjaan Mekanikal',
  'Pekerjaan Elektrikal',
  'Pekerjaan Finishing',
  'Pekerjaan Struktur',
  'Pekerjaan Arsitektur',
  'Pekerjaan Landscaping',
  'Area Lobby',
  'Area Parkir',
  'Area Koridor',
  'Area Cafeteria',
  'Area Server Room',
  'Area Toilet',
  'Pemasangan Batu Bata',
  'Pemasangan Granit',
  'Pemasangan Keramik',
  'Pemasangan Wallpaper',
  'Pemasangan Karpet',
  'Pemasangan ACP',
  'Pengecatan Dinding',
  'Pengecatan Eksterior',
  'Pengadukan Semen & Pasir',
  'Plafon Gypsum',
  'Plafon Metal',
  'Instalasi Listrik',
  'Instalasi Plumbing',
  'Instalasi AC',
  'Instalasi CCTV',
  'Instalasi Fire Alarm',
  'Pekerjaan Pondasi',
  'Pekerjaan Beton',
  'Pekerjaan Pembesian',
  'Pekerjaan Bekisting',
  'Pekerjaan Atap',
  'Pekerjaan Kusen',
  'Pekerjaan Pintu & Jendela',
  'Pekerjaan Sanitasi',
  'Pekerjaan Drainase',
  'Pekerjaan Taman',
  'Pekerjaan Pagar',
  'Material Semen',
  'Material Pasir',
  'Material Besi Beton',
  'Material Baja Ringan',
  'Material Kayu',
  'Material Cat',
  'Material Keramik',
  'Upah Borongan',
  'Upah Harian',
  'Sewa Alat Berat',
  'Sewa Scaffolding',
  'Sewa Concrete Pump',
  'Mobilisasi & Demobilisasi',
  'Manajemen Proyek',
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
  'Kayu Meranti 5x10',
  'Cat Dinding Dulux',
  'Triplek 9mm',
  'GRC Board',
  'Gypsum Board',
  'Rockwool 50mm',
  'Kawat Beton',
  'Pipa PVC 3"',
  'Pipa PVC 4"',
  'Pipa Galvanis 2"',
];

const PAGE_SIZE = 8;

function Harness({ initial, nameOptions }: { initial: BOQPlanningNode[]; nameOptions?: string[] }) {
  const [value, setValue] = useState<BOQPlanningNode[]>(initial);
  const [isComplete, setIsComplete] = useState(false);
  return (
    <BOQPlanningDetail
      value={value}
      onChange={setValue}
      nameOptions={nameOptions}
      isComplete={isComplete}
      onComplete={() => setIsComplete((prev) => !prev)}
    />
  );
}

/** Simulates paginated API: loads PAGE_SIZE options at a time on scroll-to-bottom. */
function HarnessWithInfiniteScroll({ initial }: { initial: BOQPlanningNode[] }) {
  const [value, setValue] = useState<BOQPlanningNode[]>(initial);
  const [nameOptions, setNameOptions] = useState<string[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => {
      const first = MOCK_NAME_OPTIONS.slice(0, PAGE_SIZE);
      setNameOptions(first);
      setLoadedCount(first.length);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const handleScrollEnd = useCallback(() => {
    if (loadingRef.current || loadedCount >= MOCK_NAME_OPTIONS.length) return;
    loadingRef.current = true;
    setIsLoading(true);
    setTimeout(() => {
      setNameOptions((prev) => {
        const next = MOCK_NAME_OPTIONS.slice(0, prev.length + PAGE_SIZE);
        setLoadedCount(next.length);
        return next;
      });
      setIsLoading(false);
      loadingRef.current = false;
    }, 500);
  }, [loadedCount]);

  const hasMore = loadedCount < MOCK_NAME_OPTIONS.length;

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Opsi dimuat: {loadedCount}/{MOCK_NAME_OPTIONS.length}
        {isLoading && ' · Memuat…'}
      </p>
      <BOQPlanningDetail
        value={value}
        onChange={setValue}
        nameOptions={nameOptions}
        isComplete={isComplete}
        onComplete={() => setIsComplete((prev) => !prev)}
        onNameOptionsScrollEnd={hasMore ? handleScrollEnd : undefined}
      />
    </div>
  );
}

/**
 * Full end-to-end: tree + planning cost dialog with combobox on Material Cost name column.
 * Click the Eye icon on any leaf node to open the dialog and test the combobox.
 */
function HarnessWithCostCombobox({ initial }: { initial: BOQPlanningNode[] }) {
  const [value, setValue] = useState<BOQPlanningNode[]>(initial);
  const [visibleOptions, setVisibleOptions] = useState(() =>
    ALL_MATERIAL_OPTIONS.slice(0, PAGE_SIZE)
  );
  const [filteredOptions, setFilteredOptions] = useState<string[] | null>(null);
  const [isComplete, setIsComplete] = useState(false);
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
      setVisibleOptions((prev) => ALL_MATERIAL_OPTIONS.slice(0, prev.length + PAGE_SIZE));
      loadingRef.current = false;
    }, 400);
  }, [hasNextPage]);

  const planningCostTypes = useMemo<BOQCostType[]>(
    () => [
      {
        value: 'material_cost',
        label: 'Material Cost',
        nameCombobox: {
          options: filteredOptions ?? visibleOptions,
          onSearch: handleSearch,
          onScrollEnd: handleScrollEnd,
          hasNextPage,
        },
      },
      { value: 'equipment_cost', label: 'Equipment Cost' },
      { value: 'man_power_cost', label: 'Man Power Cost' },
      { value: 'transport_cost', label: 'Transport Cost', disabled: true },
      { value: 'preliminery_cost', label: 'Preliminery Cost' },
    ],
    [filteredOptions, visibleOptions, handleSearch, handleScrollEnd, hasNextPage]
  );

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Click the Eye icon on a leaf node → open cost dialog → click a name cell in Material Cost.{' '}
        Options loaded: {visibleOptions.length}/{ALL_MATERIAL_OPTIONS.length}
        {filteredOptions !== null && ` · ${filteredOptions.length} matching`}
      </p>
      <BOQPlanningDetail
        value={value}
        onChange={setValue}
        nameOptions={MOCK_NAME_OPTIONS}
        planningCostTypes={planningCostTypes}
        isComplete={isComplete}
        onComplete={() => setIsComplete((prev) => !prev)}
      />
    </div>
  );
}

const meta: Meta<typeof BOQPlanningDetail> = {
  title: 'Templates/BOQ Planning/BOQPlanningDetail',
  component: BOQPlanningDetail,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof BOQPlanningDetail>;

/** Paginated name options loaded 8 at a time — scroll dropdown to bottom to load more. */
export const Default: Story = { render: () => <HarnessWithInfiniteScroll initial={SEED} /> };

/** No rows, no name options — free text only. */
export const Empty: Story = { render: () => <Harness initial={[]} /> };

/** All options pre-loaded (no pagination). */
export const WithOptions: Story = {
  render: () => <Harness initial={SEED} nameOptions={MOCK_NAME_OPTIONS} />,
};

export const Complete: Story = {
  render: () => {
    const [value, setValue] = useState<BOQPlanningNode[]>(SEED);
    return (
      <BOQPlanningDetail
        value={value}
        onChange={setValue}
        isComplete={true}
        onComplete={() => {}}
      />
    );
  },
};

/** Click Eye on any leaf node — Material Cost name column uses a paginated + searchable combobox. */
export const WithCostCombobox: Story = {
  render: () => <HarnessWithCostCombobox initial={SEED} />,
};

/** L5 deepest node — add child button hidden. */
export const MaxDepth: Story = {
  render: () => (
    <Harness
      initial={[
        {
          id: 'a',
          name: 'L1',
          jenis: 'Job',
          bobot: null,
          children: [
            {
              id: 'a1',
              name: 'L2',
              jenis: 'Job',
              bobot: null,
              children: [
                {
                  id: 'a11',
                  name: 'L3',
                  jenis: 'Job',
                  bobot: null,
                  children: [
                    {
                      id: 'a111',
                      name: 'L4',
                      jenis: 'Job',
                      bobot: null,
                      children: [leaf('a1111', 'L5 (deepest — no add child)')],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]}
    />
  ),
};

/** Example with English labels — demonstrates the labels-as-props customization. */
export const WithEnglishLabels: Story = {
  render: () => {
    const [value, setValue] = useState<BOQPlanningNode[]>(SEED);
    const [isComplete, setIsComplete] = useState(false);
    return (
      <BOQPlanningDetail
        value={value}
        onChange={setValue}
        nameOptions={MOCK_NAME_OPTIONS}
        isComplete={isComplete}
        onComplete={() => setIsComplete((prev) => !prev)}
        labels={{
          header: {
            title: 'BOQ Planning',
            searchPlaceholder: 'Search...',
            tambahButton: 'Add',
            simpanButton: 'Save',
            emptyMessage: 'No data yet',
          },
          contextMenu: {
            cut: 'Cut',
            copy: 'Copy',
            paste: 'Paste',
            insertAbove: 'Insert row above',
            insertBelow: 'Insert row below',
            delete: 'Delete row',
            makeLast: 'Move to bottom',
            addChild: 'Add child',
          },
          columns: {
            kode: 'Code',
            jobItem: 'Job/Item',
            jenis: 'Type',
            rab: 'RAB',
            uom: 'UOM',
            volume: 'Volume',
            remarks: 'Remarks',
          },
          tooltips: {
            viewDetail: 'View cost details',
            addMenu: 'Add menu',
            addSubMenu: 'Add sub-menu',
          },
        }}
      />
    );
  },
};
