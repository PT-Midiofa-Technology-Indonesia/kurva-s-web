'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { DataTable } from '@/components/organisms/DataTable'; // Updated import
import { Checkbox } from '@/shared/components/atoms/Checkbox';
import { AsyncSelect } from '@/shared/components/atoms/Select';
import { PROCUREMENT_LABELS } from '../constants';
import type { PoDraftProject, PurchaseRequest } from '../types/api';

interface StepPilihPrSectionProps {
  projects: PoDraftProject[];
  projectsLoading: boolean;
  selectedProjectId: string | null;
  onSelectProject: (id: string, name: string) => void;
  prs: PurchaseRequest[];
  prsLoading: boolean;
  selectedPrIds: string[];
  onTogglePr: (id: string) => void;
  commonType: string | null;
  onSetCommonType: (type: 'materialTool' | 'serviceRental' | null) => void;
}

export function StepPilihPrSection({
  projects,
  projectsLoading,
  selectedProjectId,
  onSelectProject,
  prs,
  prsLoading,
  selectedPrIds,
  onTogglePr,
  commonType,
  onSetCommonType,
}: StepPilihPrSectionProps) {
  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: p.id, label: p.name })),
    [projects]
  );

  // ── Validate PR selection: same type, bundle lock ──
  const canSelect = useCallback(
    (pr: PurchaseRequest): { allowed: boolean; reason?: string } => {
      const currentSelected = prs.filter((p) => selectedPrIds.includes(p.id));

      // First selection
      if (currentSelected.length === 0) return { allowed: true };

      // Bundle lock: if already selected and it's bundle, can't add more
      if (currentSelected.some((p) => p.source === 'bundle')) {
        return { allowed: false, reason: 'PR Bundle hanya bisa diproses sendiri' };
      }

      // Type mismatch
      const firstType = currentSelected[0]?.type;
      if (firstType && pr.type !== firstType) {
        return { allowed: false, reason: 'Tipe PR harus sama' };
      }

      // Can't add bundle on top of existing
      if (pr.source === 'bundle' && currentSelected.length > 0) {
        return { allowed: false, reason: 'PR Bundle harus diproses sendiri' };
      }

      return { allowed: true };
    },
    [prs, selectedPrIds]
  );

  // Update common type when selection changes
  const handleToggle = useCallback(
    (id: string) => {
      onTogglePr(id);
      const pr = prs.find((p) => p.id === id);
      if (!pr) return;
      const afterSelect = selectedPrIds.includes(id)
        ? selectedPrIds.filter((x) => x !== id)
        : [...selectedPrIds, id];

      // Recalculate common type
      const selected = prs.filter((p) => afterSelect.includes(p.id));
      if (selected.length === 0) {
        onSetCommonType(null);
      } else {
        const types = [...new Set(selected.map((p) => p.type))];
        onSetCommonType(types.length === 1 ? (types[0] as 'materialTool' | 'serviceRental') : null);
      }
    },
    [prs, selectedPrIds, onTogglePr, onSetCommonType]
  );

  const labels = PROCUREMENT_LABELS.PO_DRAFT.SELECT_PR;

  const columns: ColumnDef<PurchaseRequest>[] = useMemo(
    () => [
      {
        id: 'select',
        header: () => null,
        cell: ({ row }) => {
          const pr = row.original;
          const { allowed, reason } = canSelect(pr);
          if (pr.id && selectedPrIds.includes(pr.id)) {
            return <Checkbox checked onCheckedChange={() => handleToggle(pr.id)} />;
          }
          return (
            <Checkbox
              checked={false}
              disabled={!allowed}
              title={reason}
              onCheckedChange={() => handleToggle(pr.id)}
            />
          );
        },
        size: 48,
      },
      {
        accessorKey: 'code',
        header: labels.COLUMNS.NO_PR,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-900">{row.original.code}</span>
        ),
      },
      {
        accessorKey: 'projectName',
        header: labels.COLUMNS.PR_APPROVED,
        cell: ({ row }) => (
          <span className="text-sm text-slate-700">
            {row.original.notes || row.original.projectName}
          </span>
        ),
      },
      {
        accessorKey: 'sourceLabel',
        header: labels.COLUMNS.SOURCE,
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">{row.original.sourceLabel}</span>
        ),
      },
    ],
    [selectedPrIds, canSelect, handleToggle, labels]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">{labels.PROJECT_LABEL}</span>
        <div className="w-64">
          <AsyncSelect
            options={projectOptions}
            isLoading={projectsLoading}
            value={selectedProjectId}
            onChange={(v) => {
              const p = projects.find((pr) => pr.id === v);
              onSelectProject(v as string, p?.name ?? '');
            }}
            placeholder={labels.PROJECT_PLACEHOLDER}
            isClearable
          />
        </div>
      </div>

      {!selectedProjectId && (
        <div className="flex items-center justify-center py-12 text-sm text-slate-400">
          {labels.NO_PROJECT_MESSAGE}
        </div>
      )}

      {selectedProjectId && prsLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {selectedProjectId && !prsLoading && (
        <>
          <DataTable
            columns={columns}
            data={prs}
            className="shadow-none rounded-lg border border-slate-200"
            enablePagination={false}
          />
          {commonType && (
            <div className="text-xs text-slate-500">
              {labels.TYPE_LABEL}:{' '}
              <span className="font-medium text-slate-700 capitalize">
                {commonType === 'materialTool'
                  ? labels.TYPE_MATERIAL_TOOL
                  : labels.TYPE_SERVICE_RENTAL}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
