'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import type { BOQCostNameCombobox } from '../types/boq-cost.types';
import type { BOQNode } from '../types/boq-tree.types';
import { BOQPlanningCostDialog } from './BOQPlanningCostDialog';
import type { BOQPlanningCostSection } from './boq-planning-cost.types';

const NODE: BOQNode = {
  id: 'n1',
  name: 'Pekerjaan Bangunan Office',
  jenis: 'Job',
  bobot: 10,
  children: [],
};

const SECTIONS: BOQPlanningCostSection[] = [
  {
    value: 'material_cost',
    label: 'Material Cost',
    rows: [
      {
        id: 'm1',
        code: 'M.232',
        name: 'Bata Merah ukuran 20x40',
        vol: 100,
        satuan: 'm2',
        hargaSatuan: 15000,
      },
      { id: 'm2', code: 'M.233', name: 'Pasir Kali', vol: 5, satuan: 'm3', hargaSatuan: 200000 },
      {
        id: 'm3',
        code: 'M.234',
        name: 'Semen 50 kg Merdeka',
        vol: 50,
        satuan: 'zak',
        hargaSatuan: 65000,
      },
      {
        id: 'm4',
        code: 'M.235',
        name: 'Besi Tulangan 10mm',
        vol: 200,
        satuan: 'kg',
        hargaSatuan: 12000,
      },
      {
        id: 'm5',
        code: 'M.236',
        name: 'Cat Tembok Premium',
        vol: 20,
        satuan: 'kg',
        hargaSatuan: 85000,
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
        vol: 2,
        satuan: 'unit',
        durasiSewa: 30,
        durationUoM: 'days',
        hargaSatuan: 5000000,
      },
      {
        id: 'e2',
        code: 'E.568',
        name: 'Excavator',
        vol: 1,
        satuan: 'unit',
        durasiSewa: 15,
        durationUoM: 'days',
        hargaSatuan: 3500000,
      },
      {
        id: 'e3',
        code: 'E.569',
        name: 'Mixer Beton',
        vol: 3,
        satuan: 'unit',
        durasiSewa: 45,
        durationUoM: 'days',
        hargaSatuan: 800000,
      },
    ],
  },
  {
    value: 'transport_cost',
    label: 'Transport Cost',
    disabled: true,
    rows: [
      {
        id: 't1',
        code: 'T.101',
        name: 'Ongkos Kirim Bata',
        vol: 1,
        satuan: 'ls',
        hargaSatuan: 500000,
      },
      {
        id: 't2',
        code: 'T.102',
        name: 'Ongkos Kirim Semen',
        vol: 1,
        satuan: 'ls',
        hargaSatuan: 750000,
      },
      {
        id: 't3',
        code: 'T.103',
        name: 'Ongkos Kirim Besi',
        vol: 1,
        satuan: 'ls',
        hargaSatuan: 600000,
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
        vol: 10,
        satuan: 'OH',
        durasiSewa: 8,
        durationUoM: 'hours',
        hargaSatuan: 180000,
      },
      {
        id: 'p2',
        code: 'P.323',
        name: 'Helper Bangunan Level 2',
        vol: 10,
        satuan: 'OH',
        durasiSewa: 8,
        durationUoM: 'hours',
        hargaSatuan: 120000,
      },
      {
        id: 'p3',
        code: 'P.324',
        name: 'Mandor',
        vol: 5,
        satuan: 'OH',
        durasiSewa: 8,
        durationUoM: 'hours',
        hargaSatuan: 250000,
      },
      {
        id: 'p4',
        code: 'P.325',
        name: 'Tukang Kayu',
        vol: 8,
        satuan: 'OH',
        durasiSewa: 8,
        durationUoM: 'hours',
        hargaSatuan: 200000,
      },
    ],
  },
  {
    value: 'preliminery_cost',
    label: 'Preliminery Cost',
    rows: [
      { id: 'pr1', code: 'M.231', name: 'Gaji Tukang', vol: 1, satuan: 'ls', hargaSatuan: 3000000 },
      {
        id: 'pr2',
        code: 'M.232',
        name: 'Perijinan & Asuransi',
        vol: 1,
        satuan: 'ls',
        hargaSatuan: 2500000,
      },
      {
        id: 'pr3',
        code: 'M.233',
        name: 'Keselamatan Kerja',
        vol: 1,
        satuan: 'ls',
        hargaSatuan: 1000000,
      },
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

const ALL_EQUIPMENT_OPTIONS = [
  'Crane',
  'Excavator',
  'Bulldozer',
  'Wheel Loader',
  'Dump Truck',
  'Mixer Beton',
  'Tower Crane',
  'Compactor',
  'Mobile Crane',
  'Generador',
  'Welding Machine',
  'Concrete Pump',
];

const ALL_MANPOWER_OPTIONS = [
  'Tukang Bangunan level 1',
  'Tukang Bangunan level 2',
  'Helper Bangunan Level 1',
  'Helper Bangunan Level 2',
  'Mandor',
  'Tukang Kayu',
  'Tukang Listrik',
  'Tukang Pipa',
  'Operator Crane',
  'Operator Excavator',
];

function injectCombobox(
  sections: BOQPlanningCostSection[],
  target: string,
  combobox: BOQCostNameCombobox
): BOQPlanningCostSection[] {
  return sections.map((s) => (s.value === target ? { ...s, nameCombobox: combobox } : s));
}

function Harness({ initial }: { initial: BOQPlanningCostSection[] }) {
  const [sections, setSections] = useState(initial);
  return (
    <BOQPlanningCostDialog
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

const meta: Meta<typeof BOQPlanningCostDialog> = {
  title: 'Templates/BOQ Planning/BOQPlanningCostDialog',
  component: BOQPlanningCostDialog,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof BOQPlanningCostDialog>;

/** All five cost sections, Transport Cost locked (read-only). Equipment Cost shows Durasi Sewa column. */
export const Default: Story = { render: () => <Harness initial={SECTIONS} /> };

/** All sections empty — Tambah adds the first row. */
export const Empty: Story = {
  render: () => <Harness initial={SECTIONS.map((s) => ({ ...s, disabled: false, rows: [] }))} />,
};

/** Material, Equipment, and Manpower name columns use static comboboxes — all options preloaded. */
export const WithCombobox: Story = {
  render: () => {
    function ComboboxHarness() {
      const [sections, setSections] = useState(() =>
        injectCombobox(
          injectCombobox(
            injectCombobox(SECTIONS, 'material_cost', {
              options: ALL_MATERIAL_OPTIONS,
              onSearch: () => {},
              onScrollEnd: () => {},
              hasNextPage: false,
            }),
            'equipment_cost',
            {
              options: ALL_EQUIPMENT_OPTIONS,
              onSearch: () => {},
              onScrollEnd: () => {},
              hasNextPage: false,
            }
          ),
          'man_power_cost',
          {
            options: ALL_MANPOWER_OPTIONS,
            onSearch: () => {},
            onScrollEnd: () => {},
            hasNextPage: false,
          }
        )
      );
      return (
        <BOQPlanningCostDialog
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
    return <ComboboxHarness />;
  },
};
