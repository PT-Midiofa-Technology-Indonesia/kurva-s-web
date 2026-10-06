'use client';

import { PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/atoms';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { getErrorMessage } from '@/shared/lib/api-error';
import { useProjectManpower } from '../hooks/use-project-manpower';
import { useRatingCategoriesActive } from '../hooks/use-rating-categories-active';
import type {
  ProjectManpowerListItem,
  ProjectManpowerRatingCategory,
} from '../types/project-manpower-rating';
import { ProjectManpowerRatingModal } from './ProjectManpowerRatingModal';

interface ProjectManpowerRatingSectionProps {
  projectId: string;
}

function getScoreByCategoryCode(
  row: ProjectManpowerListItem,
  category: ProjectManpowerRatingCategory
) {
  return row.rating?.scores.find((score) => score.categoryCode === category.code)?.score ?? null;
}

function getManpowerInfo(row: ProjectManpowerListItem) {
  const employeeName = row.employee?.name ?? '-';
  const employeeCode = row.employee?.code ?? '-';
  const positionName = row.hierarchy.position?.name ?? '-';
  const parentPositionName = row.hierarchy.parentPosition?.name;

  return {
    employeeName,
    employeeCode,
    positionName,
    parentPositionName,
  };
}

export function ProjectManpowerRatingSection({ projectId }: ProjectManpowerRatingSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [modalSessionId, setModalSessionId] = useState(0);

  const {
    data: manpowerItems = [],
    isLoading: isManpowerLoading,
    isError: isManpowerError,
    error: manpowerError,
  } = useProjectManpower(projectId);

  const {
    data: activeCategories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useRatingCategoriesActive();

  const sortedCategories = useMemo(
    () => [...activeCategories].sort((left, right) => left.sortOrder - right.sortOrder),
    [activeCategories]
  );

  const openModal = (employeeId: string | null) => {
    if (sortedCategories.length === 0) return;
    setModalSessionId((current) => current + 1);
    setSelectedEmployeeId(employeeId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEmployeeId(null);
  };

  const isLoading = isManpowerLoading || isCategoriesLoading;
  const hasError = isManpowerError || isCategoriesError;

  return (
    <>
      <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">Rating Manpower</h2>
            <p className="text-sm text-slate-500">
              Tabel ini hanya menampilkan Info Manpower dan kategori rating yang aktif.
            </p>
          </div>

          <Button
            onClick={() => openModal(null)}
            leftIcon={<PlusIcon className="h-4 w-4" />}
            disabled={sortedCategories.length === 0}
          >
            Beri Rating
          </Button>
        </div>

        {hasError ? (
          <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-6 py-10 text-sm text-red-700">
            Gagal memuat rating manpower. {getErrorMessage(manpowerError ?? categoriesError)}
          </div>
        ) : isLoading ? (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-[minmax(280px,1fr)_repeat(3,minmax(120px,1fr))] gap-px bg-slate-200">
              <div className="h-11 bg-slate-100" />
              <div className="h-11 bg-slate-100" />
              <div className="h-11 bg-slate-100" />
              <div className="h-11 bg-slate-100" />
            </div>
            <div className="space-y-px bg-slate-200">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[minmax(280px,1fr)_repeat(3,minmax(120px,1fr))] gap-px bg-slate-200"
                >
                  <div className="h-20 bg-white" />
                  <div className="h-20 bg-white" />
                  <div className="h-20 bg-white" />
                  <div className="h-20 bg-white" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[280px]">Info Manpower</TableHead>
                  {sortedCategories.map((category) => (
                    <TableHead key={category.id} className="min-w-[120px] text-center">
                      {category.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {manpowerItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={Math.max(sortedCategories.length + 1, 1)}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      Belum ada manpower pada project ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  manpowerItems.map((row) => {
                    const info = getManpowerInfo(row);

                    return (
                      <TableRow
                        key={row.employee?.id ?? row.hierarchy.assignmentId}
                        className={cn(
                          'group',
                          sortedCategories.length > 0
                            ? 'cursor-pointer hover:bg-slate-50'
                            : 'cursor-default'
                        )}
                        onClick={() => openModal(row.employee?.id ?? null)}
                      >
                        <TableCell className="align-top">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium text-slate-900">
                              {info.employeeName}
                            </p>
                            <p className="text-xs text-slate-500">{info.employeeCode}</p>
                            <p className="text-xs text-slate-500">
                              {info.positionName}
                              {info.parentPositionName ? ` · ${info.parentPositionName}` : ''}
                            </p>
                          </div>
                        </TableCell>
                        {sortedCategories.map((category) => {
                          const score = getScoreByCategoryCode(row, category);

                          return (
                            <TableCell
                              key={category.id}
                              className="align-top text-center text-sm font-medium text-slate-900"
                            >
                              {score ?? <span className="text-slate-400">-</span>}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <ProjectManpowerRatingModal
        key={modalSessionId}
        open={modalOpen}
        projectId={projectId}
        initialEmployeeId={selectedEmployeeId}
        onClose={closeModal}
        onSaved={() => {
          closeModal();
        }}
      />
    </>
  );
}
