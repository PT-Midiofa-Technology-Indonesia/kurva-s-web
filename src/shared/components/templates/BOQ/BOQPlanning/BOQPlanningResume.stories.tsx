'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import type { BOQNode } from '../types/boq-tree.types';
import { BOQPlanningResume } from './BOQPlanningResume';
import type { BOQResumeEquipmentSection, BOQResumeMaterialSection } from './boq-resume.types';

const NODE: BOQNode = {
  id: 'n1',
  name: 'Pekerjaan Bangunan Office',
  jenis: 'Job',
  bobot: 10,
  children: [],
};

const MATERIAL: BOQResumeMaterialSection = {
  value: 'material_transport',
  label: 'Resume Material & Transportation Cost',
  rows: [
    {
      id: 'm1',
      code: 'M.231',
      name: 'Bata Merah ukuran 20x40',
      vol: 100,
      satuan: 'biji',
      materialOriginal: 2000,
      materialMarkup: 25,
      transportOriginal: 80000,
      transportMarkup: 40,
    },
    {
      id: 'm2',
      code: 'M.232',
      name: 'Pasir Kali',
      vol: 50,
      satuan: 'm3',
      materialOriginal: 400000,
      materialMarkup: 25,
      transportOriginal: 20000,
      transportMarkup: 40,
    },
    {
      id: 'm3',
      code: 'M.233',
      name: 'Semen 50 kg Merdeka',
      vol: 45,
      satuan: 'sak',
      materialOriginal: 80000,
      materialMarkup: 20,
      transportOriginal: 2000,
      transportMarkup: 40,
    },
  ],
};

const EQUIPMENT: BOQResumeEquipmentSection = {
  value: 'equipment',
  label: 'Resume Equipment Cost',
  rows: [
    {
      id: 'e1',
      code: 'E.567',
      name: 'Crane',
      vol: 1,
      satuan: 'unit',
      duration: 200,
      durationUoM: 'jam',
      equipmentOriginal: 200000,
      equipmentMarkup: 10,
      transportOriginal: 3000000,
      transportMarkup: 40,
    },
  ],
};

const meta: Meta<typeof BOQPlanningResume> = {
  title: 'Templates/BOQ Planning/BOQPlanningResume',
  component: BOQPlanningResume,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof BOQPlanningResume>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [material, setMaterial] = useState(MATERIAL);
    const [equipment, setEquipment] = useState(EQUIPMENT);
    return (
      <BOQPlanningResume
        node={NODE}
        open={open}
        onOpenChange={setOpen}
        materialSection={material}
        equipmentSection={equipment}
        onMaterialRowsChange={(rows) => setMaterial((s) => ({ ...s, rows }))}
        onEquipmentRowsChange={(rows) => setEquipment((s) => ({ ...s, rows }))}
      />
    );
  },
};

export const ReadOnly: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <BOQPlanningResume
        node={NODE}
        open={open}
        onOpenChange={setOpen}
        materialSection={MATERIAL}
        equipmentSection={EQUIPMENT}
        readOnly
      />
    );
  },
};
