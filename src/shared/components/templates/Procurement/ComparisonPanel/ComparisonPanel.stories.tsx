'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import { useCallback, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { BoQRow, VendorColumnDef } from './ComparisonPanel';
import { ComparisonPanel } from './ComparisonPanel';

/* ── Seed data matching images ── */

const SEED_ROWS: BoQRow[] = [
  {
    id: '1',
    no: 1,
    material: 'Bata Merah ukuran 20x40',
    volPo: 50,
    uom: 'biji',
    boqFinal: { unitPrice: 2500, totalPrice: 125000 },
    boqCco: { unitPrice: 2500, totalPrice: 125000 },
  },
  {
    id: '2',
    no: 2,
    material: 'Pasir Kali',
    volPo: 5,
    uom: 'm3',
    boqFinal: { unitPrice: 500000, totalPrice: 2500000 },
    boqCco: { unitPrice: 500000, totalPrice: 2500000 },
  },
  {
    id: '3',
    no: 3,
    material: 'Semen 50 kg Merdeka',
    volPo: 2,
    uom: 'sak',
    boqFinal: { unitPrice: 30000, totalPrice: 60000 },
    boqCco: { unitPrice: 30000, totalPrice: 60000 },
  },
];

/* ── Harness with Add Column button ── */

function VendorHarness() {
  const [rows] = useState<BoQRow[]>(SEED_ROWS);
  const [vendorCols, setVendorCols] = useState<VendorColumnDef[]>([]);
  const [vendorData, setVendorData] = useState<
    Record<string, { unitPrice: number; totalPrice: number }[]>
  >({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogVendorId, setDialogVendorId] = useState<string | null>(null);

  const addVendor = useCallback(() => {
    const nextId = String(vendorCols.length + 1);
    const label = `Vendor ${String.fromCharCode(64 + vendorCols.length + 1)}`;
    setVendorCols((prev) => [...prev, { id: nextId, label }]);
    // init vendor price data for all rows
    setVendorData((prev) => ({
      ...prev,
      [nextId]: rows.map(() => ({ unitPrice: 0, totalPrice: 0 })),
    }));
  }, [vendorCols, rows]);

  const handleVendorAction = useCallback((vendorId: string) => {
    setDialogVendorId(vendorId);
    setDialogOpen(true);
  }, []);

  const vendorLabel = dialogVendorId
    ? (vendorCols.find((v) => v.id === dialogVendorId)?.label ?? 'Vendor')
    : 'Vendor';

  return (
    <div className="space-y-4 p-6">
      {/* Add Column button — outside ComparisonPanel as requested */}
      <div className="flex items-center justify-end">
        <Button type="button" onClick={addVendor}>
          + Add Column
        </Button>
      </div>

      <ComparisonPanel
        rows={rows}
        vendorColumns={vendorCols}
        vendorData={vendorData}
        onVendorDataChange={(vendorId, prices) =>
          setVendorData((prev) => ({ ...prev, [vendorId]: prices }))
        }
        onVendorAction={handleVendorAction}
      />

      {/* Example dialog triggered by vendor icon button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aksi {vendorLabel}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Ini contoh dialog yang dipanggil dari ikon di header kolom {vendorLabel}. Bisa diganti
            dengan upload file, pilih vendor, dll.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Stories ── */

const meta: Meta<typeof ComparisonPanel> = {
  title: 'Templates/Procurement/ComparisonPanel',
  component: ComparisonPanel,
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof ComparisonPanel>;

/** Initial state — BoQ Final + BoQ CCO columns (image 1) */
export const Default: Story = {
  render: () => <ComparisonPanel rows={SEED_ROWS} vendorColumns={[]} vendorData={{}} />,
};

/** With vendor columns added — demonstrates Add Column from story controls (image 2) */
export const WithVendors: Story = {
  render: () => <VendorHarness />,
};
