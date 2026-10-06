'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import type { BOQNode } from '../types/boq-tree.types';
import { BOQExecutionCostDialog } from './BOQExecutionCostDialog';
import type { BOQExecutionCostSection } from './boq-execution-cost-columns';

const NODE: BOQNode = {
  id: 'n1',
  name: 'Penataan Bata Dinding',
  jenis: 'Job',
  bobot: 10,
  children: [],
};

const SECTIONS: BOQExecutionCostSection[] = [
  {
    value: 'material_cost',
    label: 'Material Cost',
    rows: [
      {
        id: 'm1',
        code: 'M.232',
        name: 'Bata Merah ukuran 20x40',
        vol_rab: 50,
        vol_cco: 50,
        vol_actual: 30,
        satuan: 'biji',
        hargaSatuan_rab: 0,
        hargaSatuan_cco: 0,
        hargaSatuan_actual: 0,
      },
      {
        id: 'm2',
        code: 'M.233',
        name: 'Pasir Kali',
        vol_rab: 5,
        vol_cco: 5,
        vol_actual: 4,
        satuan: 'm3',
        hargaSatuan_rab: 0,
        hargaSatuan_cco: 0,
        hargaSatuan_actual: 0,
      },
      {
        id: 'm3',
        code: 'M.234',
        name: 'Semen 50 kg Merdeka',
        vol_rab: 2,
        vol_cco: 2,
        vol_actual: 1,
        satuan: 'sak',
        hargaSatuan_rab: 0,
        hargaSatuan_cco: 0,
        hargaSatuan_actual: 0,
      },
    ],
  },
  {
    value: 'equipment_cost',
    label: 'Equipment Cost',
    rows: [
      {
        id: 'e1',
        code: 'E.567',
        name: 'Crane',
        vol_rab: 2,
        vol_cco: 2,
        vol_actual: 2,
        satuan: 'unit',
        durasiSewa_rab: 10,
        durasiSewa_cco: 10,
        durasiSewa_actual: 15,
        durationUoM: 'jam',
        hargaSatuan_rab: 2000000,
        hargaSatuan_cco: 2000000,
        hargaSatuan_actual: 1800000,
      },
    ],
  },
  {
    value: 'transport_cost',
    label: 'Transport Cost',
    rows: [
      {
        id: 't1',
        code: 'M.232',
        name: 'Bata Merah ukuran 20x40',
        vol_rab: 50,
        vol_cco: 50,
        vol_actual: 30,
        satuan: 'biji',
        hargaSatuan_rab: 0,
        hargaSatuan_cco: 0,
        hargaSatuan_actual: 0,
      },
      {
        id: 't2',
        code: 'M.233',
        name: 'Pasir Kali',
        vol_rab: 5,
        vol_cco: 5,
        vol_actual: 4,
        satuan: 'm3',
        hargaSatuan_rab: 0,
        hargaSatuan_cco: 0,
        hargaSatuan_actual: 0,
      },
      {
        id: 't3',
        code: 'M.234',
        name: 'Semen 50 kg Merdeka',
        vol_rab: 2,
        vol_cco: 2,
        vol_actual: 1,
        satuan: 'sak',
        hargaSatuan_rab: 0,
        hargaSatuan_cco: 0,
        hargaSatuan_actual: 0,
      },
    ],
  },
  {
    value: 'man_power_cost',
    label: 'Manpower Cost',
    rows: [
      {
        id: 'p1',
        code: 'P.322',
        name: 'Tukang Bangunan level 1',
        vol_rab: 1,
        vol_cco: 1,
        vol_actual: 1,
        satuan: 'orang',
        durasiSewa_rab: 0.5,
        durasiSewa_cco: 0.5,
        durasiSewa_actual: 0.3,
        durationUoM: 'hour',
        hargaSatuan_rab: 30000,
        hargaSatuan_cco: 30000,
        hargaSatuan_actual: 35000,
      },
      {
        id: 'p2',
        code: 'P.323',
        name: 'Helper Bangunan Level 2',
        vol_rab: 2,
        vol_cco: 2,
        vol_actual: 1,
        satuan: 'orang',
        durasiSewa_rab: 0.5,
        durasiSewa_cco: 0.5,
        durasiSewa_actual: 0.6,
        durationUoM: 'hour',
        hargaSatuan_rab: 20000,
        hargaSatuan_cco: 20000,
        hargaSatuan_actual: 15000,
      },
      {
        id: 'p3',
        code: 'P.324',
        name: 'Mandor Bangunan level 2',
        vol_rab: 1,
        vol_cco: 2,
        vol_actual: 1,
        satuan: 'orang',
        durasiSewa_rab: 0.1,
        durasiSewa_cco: 0.1,
        durasiSewa_actual: 0.1,
        durationUoM: 'hour',
        hargaSatuan_rab: 40000,
        hargaSatuan_cco: 40000,
        hargaSatuan_actual: 40000,
      },
    ],
  },
  {
    value: 'preliminery_cost',
    label: 'Preliminery Cost',
    rows: [
      {
        id: 'pr1',
        code: 'M.231',
        name: 'Gaji Tukang',
        vol_rab: 1,
        vol_cco: 1,
        vol_actual: 1,
        satuan: 'LS',
        hargaSatuan_rab: 2000000,
        hargaSatuan_cco: 2000000,
        hargaSatuan_actual: 1500000,
      },
      {
        id: 'pr2',
        code: 'M.232',
        name: 'Tiket Pesawat',
        vol_rab: 1,
        vol_cco: 1,
        vol_actual: 1,
        satuan: 'LS',
        hargaSatuan_rab: 5000000,
        hargaSatuan_cco: 5000000,
        hargaSatuan_actual: 2000000,
      },
      {
        id: 'pr3',
        code: 'M.233',
        name: 'Mess Karyawan',
        vol_rab: 1,
        vol_cco: 1,
        vol_actual: 1,
        satuan: 'LS',
        hargaSatuan_rab: 4000000,
        hargaSatuan_cco: 4000000,
        hargaSatuan_actual: 2000000,
      },
    ],
  },
];

const meta: Meta<typeof BOQExecutionCostDialog> = {
  title: 'Templates/BOQ Execution/BOQExecutionCostDialog',
  component: BOQExecutionCostDialog,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof BOQExecutionCostDialog>;

/** All five cost sections populated. Read-only (no comboboxes, no edit). */
export const Default: Story = {
  render: () => (
    <BOQExecutionCostDialog node={NODE} open onOpenChange={() => {}} sections={SECTIONS} />
  ),
};

/** Loading skeleton state while data fetches. */
export const Loading: Story = {
  render: () => (
    <BOQExecutionCostDialog node={NODE} open onOpenChange={() => {}} sections={[]} isLoading />
  ),
};

/** All sections empty. */
export const Empty: Story = {
  render: () => (
    <BOQExecutionCostDialog
      node={NODE}
      open
      onOpenChange={() => {}}
      sections={SECTIONS.map((s) => ({ ...s, rows: [] }))}
    />
  ),
};
