'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import type { BOQTemplateDetail } from '../api/get-boq-template';

interface BOQTemplateInfoCardProps {
  template: BOQTemplateDetail;
}

export function BOQTemplateInfoCard({ template }: BOQTemplateInfoCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-[18px]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-950">Informasi Template</h2>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:bg-slate-50"
        >
          <ChevronDown
            className="w-4 h-4 text-slate-950 transition-transform duration-200"
            style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
          />
        </button>
      </div>
      {open && (
        <div className="grid grid-cols-3 gap-x-8 gap-y-6 mt-6">
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-normal text-slate-500">Nama Template</Label>
            <p className="text-sm font-medium text-slate-950">{template.name}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-normal text-slate-500">Project Capability</Label>
            <p className="text-sm font-medium text-slate-950">
              {template.projectCapability?.name || '-'}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-normal text-slate-500">Status</Label>
            <div>
              <Badge variant={template.isActive ? 'success' : 'destructive'}>
                {template.isActive ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
