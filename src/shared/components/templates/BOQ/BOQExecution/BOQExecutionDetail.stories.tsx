'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BOQLabels } from '../types/boq-labels.types';
import { BOQExecutionDetail } from './BOQExecutionDetail';
import type { BOQExecutionNode } from './types/boq-execution.types';

const leaf = (id: string, name: string, patch?: Partial<BOQExecutionNode>): BOQExecutionNode => ({
  id,
  name,
  jenis: 'Job',
  bobot: null,
  children: [],
  ...patch,
});

const SEED: BOQExecutionNode[] = [
  {
    id: 'a',
    name: 'Pekerjaan Bangunan Office',
    jenis: 'Job',
    bobot: null,
    children: [
      {
        id: 'a1',
        name: 'Pekerjaan Civil',
        jenis: 'Job',
        bobot: null,
        children: [
          {
            id: 'a11',
            name: 'Area Lobby',
            jenis: 'Location',
            bobot: null,
            children: [
              {
                id: 'a111',
                name: 'Pengerjaan Dinding',
                jenis: 'Job',
                bobot: null,
                volume: { rab: 15, cco: 10, actual: 0, uom: 'm2' },
                unitPrice: {
                  material: { rab: 40039000, cco: 40039000, actual: 0 },
                  work: { rab: 0, cco: 0, actual: 0 },
                },
                totalPrice: {
                  material: { rab: 600585000, cco: 400390000, actual: 0 },
                  work: { rab: 594258500, cco: 594258500, actual: 0 },
                },
                amount: { rab: 600585000, cco: 400390000, actual: 594258500 },
                children: [
                  leaf('a1111', 'Penataan Bata Dinding', {
                    detailsFilledCount: 5,
                    volume: { rab: 50, cco: 50, actual: 30, uom: 'm2' },
                    unitPrice: {
                      material: { rab: 0, cco: 0, actual: 0 },
                      work: { rab: 40039000, cco: 40039000, actual: 54023500 },
                    },
                    totalPrice: {
                      material: { rab: 0, cco: 0, actual: 0 },
                      work: { rab: 40039000, cco: 40039000, actual: 54023500 },
                    },
                    amount: { rab: 40039000, cco: 40039000, actual: 54023500 },
                    uomId: 'uom-m2',
                    uomLabel: 'm2',
                    remarks: '',
                  }),
                  leaf('a1112', 'Pemasangan Granit', {
                    detailsFilledCount: 3,
                    volume: { rab: 100, cco: 100, actual: 80, uom: 'm2' },
                    amount: { rab: 150000000, cco: 150000000, actual: 120000000 },
                    remarks: 'Ongkos pasang termasuk bahan',
                  }),
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
  'Pengerjaan Dinding',
  'Pemasangan Granit',
  'Pemasangan Keramik',
  'Pemasangan Wallpaper',
  'Pemasangan Karpet',
  'Pemasangan ACP',
  'Pengecatan Dinding',
  'Pengecatan Eksterior',
  'Penataan Bata Dinding',
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

const PAGE_SIZE = 8;

function Harness({
  initial,
  nameOptions,
}: {
  initial: BOQExecutionNode[];
  nameOptions?: string[];
}) {
  const [value, setValue] = useState<BOQExecutionNode[]>(initial);
  const [isComplete, setIsComplete] = useState(false);
  return (
    <BOQExecutionDetail
      value={value}
      onChange={setValue}
      nameOptions={nameOptions}
      isComplete={isComplete}
      onComplete={() => setIsComplete((prev) => !prev)}
    />
  );
}

/** Simulates paginated API: loads PAGE_SIZE options at a time on scroll-to-bottom. */
function HarnessWithInfiniteScroll({ initial }: { initial: BOQExecutionNode[] }) {
  const [value, setValue] = useState<BOQExecutionNode[]>(initial);
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
      <BOQExecutionDetail
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

const meta: Meta<typeof BOQExecutionDetail> = {
  title: 'Templates/BOQ Execution/BOQExecutionDetail',
  component: BOQExecutionDetail,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof BOQExecutionDetail>;

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
    const [value, setValue] = useState<BOQExecutionNode[]>(SEED);
    return (
      <BOQExecutionDetail
        value={value}
        onChange={setValue}
        isComplete={true}
        onComplete={() => {}}
      />
    );
  },
};

/** Read-only mode — no add/edit/delete buttons. */
export const ReadOnly: Story = {
  render: () => {
    const [value] = useState<BOQExecutionNode[]>(SEED);
    return (
      <BOQExecutionDetail
        value={value}
        onChange={() => {}}
        readOnly
        nameOptions={MOCK_NAME_OPTIONS}
      />
    );
  },
};

/** Deepest node — add child button hidden. */
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
                      children: [
                        leaf('a1111', 'L5 (deepest — no add child)', {
                          volume: { rab: 10, cco: 10, actual: 5, uom: 'm2' },
                        }),
                      ],
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

/** Once complete — volume_cco and volume_actual cells are locked. */
export const WithCompleteLocked: Story = {
  render: () => {
    const [value, setValue] = useState<BOQExecutionNode[]>(SEED);
    const [isComplete, setIsComplete] = useState(false);
    return (
      <BOQExecutionDetail
        value={value}
        onChange={setValue}
        nameOptions={MOCK_NAME_OPTIONS}
        isComplete={isComplete}
        onComplete={() => setIsComplete((prev) => !prev)}
      />
    );
  },
};

/** Example with English labels — demonstrates the labels-as-props customization. */
export const WithEnglishLabels: Story = {
  render: () => {
    const [value, setValue] = useState<BOQExecutionNode[]>(SEED);
    const [isComplete, setIsComplete] = useState(false);
    const labels: BOQLabels = {
      header: {
        title: 'BoQ Execution',
        searchPlaceholder: 'Search...',
        tambahButton: 'Add',
        simpanButton: 'Save',
        completeLabel: 'Complete',
        fullscreenEnter: 'Fullscreen',
        fullscreenExit: 'Exit fullscreen',
        emptyMessage: 'No data yet',
      },
      columns: {
        kode: 'Code',
        jobItem: 'Job/Item',
        jenis: 'Type',
        rab: 'RAB',
        uom: 'UoM',
        volume: 'Volume',
        remarks: 'Remarks',
        tambah: 'Cost',
      },
      tooltips: {
        viewDetail: 'View cost details',
        addMenu: 'Add item',
        addSubMenu: 'Add sub-item',
      },
    };
    return (
      <BOQExecutionDetail
        value={value}
        onChange={setValue}
        nameOptions={MOCK_NAME_OPTIONS}
        isComplete={isComplete}
        onComplete={() => setIsComplete((prev) => !prev)}
        labels={labels}
      />
    );
  },
};
