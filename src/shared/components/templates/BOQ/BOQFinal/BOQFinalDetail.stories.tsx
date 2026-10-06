'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import type { BOQPlanningNode } from '../types/boq-planning.types';
import { BOQFinalDetail } from './BOQFinalDetail';

const leaf = (id: string, name: string, extra?: Partial<BOQPlanningNode>): BOQPlanningNode => ({
  id,
  name,
  jenis: 'Job',
  bobot: null,
  children: [],
  ...extra,
});

const SEED: BOQPlanningNode[] = [
  {
    id: 'a',
    name: 'Pekerjaan Bangunan Office',
    jenis: 'Job',
    bobot: 10,
    volume: { rab: 1, uom: 'ls' },
    amount: { rab: 250000000 },
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
                  leaf('a1111', 'Pengadukan Semen & Pasir', {
                    detailsFilledCount: 3,
                    volume: { rab: 12, uom: 'm3' },
                    amount: { rab: 4800000 },
                    remarks: 'Mix 1:4',
                  }),
                  leaf('a1112', 'Pemasangan Granit', {
                    detailsFilledCount: 5,
                    volume: { rab: 40, uom: 'm2' },
                    amount: { rab: 18000000 },
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

const meta: Meta<typeof BOQFinalDetail> = {
  title: 'Templates/BOQ Final/BOQFinalDetail',
  component: BOQFinalDetail,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof BOQFinalDetail>;

/** Read-only preview: no editing, no Tambah/Simpan, no Complete switch, no context menu. */
export const Default: Story = {
  render: () => {
    const [value] = useState<BOQPlanningNode[]>(SEED);
    return <BOQFinalDetail value={value} />;
  },
};

/** Click the Eye icon on a deepest-level (leaf) row to open the cost detail dialog — read-only. */
export const WithCostDetail: Story = {
  render: () => {
    const [value] = useState<BOQPlanningNode[]>(SEED);
    return (
      <div>
        <p className="mb-2 text-sm text-muted-foreground">
          Click the Eye icon on a leaf row (e.g. &ldquo;Pemasangan Granit&rdquo;) to open the
          read-only cost dialog.
        </p>
        <BOQFinalDetail value={value} />
      </div>
    );
  },
};
