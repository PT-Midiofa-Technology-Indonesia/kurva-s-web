'use client';

import { AlertCircle, ArrowLeft, Plus, Settings, X } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import {
  Card,
  Checkbox,
  Input,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { PERFORMANCE_LABELS } from '../constants';
import {
  useDeleteGradeAction,
  useEmployeeGradeSettings,
  usePerformanceActions,
  usePillarComponents,
  useSaveGradeActions,
  useSavePillarComponents,
} from '../hooks';
import type { EmployeeGradeDetailSetting, KPIAction, KPIGradePillarSetting } from '../types';

type PickerState =
  | { type: 'reward' | 'punishment'; grade: EmployeeGradeDetailSetting }
  | { type: 'component'; pillar: KPIGradePillarSetting }
  | null;

const letters = ['A', 'B', 'C', 'D', 'E'];
const defaultPillars: KPIGradePillarSetting[] = [
  { id: 'productivity', name: PERFORMANCE_LABELS.DETAIL.PILLARS.PRODUCTIVITY, components: [] },
  { id: 'attendance', name: PERFORMANCE_LABELS.DETAIL.PILLARS.ATTENDANCE, components: [] },
  { id: 'quality', name: PERFORMANCE_LABELS.DETAIL.PILLARS.WORK_QUALITY, components: [] },
];

function actionLabel(action: KPIAction) {
  return action.name ?? action.title ?? action.description ?? '-';
}

function getGradeStyle(gradeLabel: string) {
  const upper = gradeLabel.toUpperCase();
  if (upper.includes('A')) return 'bg-emerald-500 text-white';
  if (upper.includes('B')) return 'bg-lime-500 text-white';
  if (upper.includes('C')) return 'bg-amber-500 text-white';
  if (upper.includes('D')) return 'bg-slate-500 text-white';
  return 'bg-rose-500 text-white';
}

export function KPIGradeSettingsPage() {
  const params = useParams<{ gradeId?: string }>();
  const resolvedGradeId = params.gradeId ?? '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyFilter();
  const detail = useEmployeeGradeSettings(resolvedGradeId, { companyId });
  const [picker, setPicker] = useState<PickerState>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [componentWeights, setComponentWeights] = useState<Record<string, number>>({});
  const rewards = usePerformanceActions('reward', { companyId });
  const punishments = usePerformanceActions('punishment', { companyId });
  const activePillarId =
    picker?.type === 'component' ? (picker.pillar.performancePillarId ?? picker.pillar.id) : '';
  const components = usePillarComponents(activePillarId, { companyId });
  const saveActions = useSaveGradeActions(resolvedGradeId, companyId);
  const deleteAction = useDeleteGradeAction(resolvedGradeId, companyId);
  const saveComponents = useSavePillarComponents(resolvedGradeId, companyId);

  const data = detail.data?.data;
  const gradeCode = data?.code ?? searchParams.get('code') ?? resolvedGradeId;
  const gradeRows = useMemo<EmployeeGradeDetailSetting[]>(() => {
    const rows = data?.gradeSettings ?? data?.grades ?? [];
    if (rows.length) return rows;
    return letters.map((grade) => ({ id: grade, grade, code: grade, name: `Grade ${grade}` }));
  }, [data]);
  const pillars = data?.pillars?.length ? data.pillars : defaultPillars;
  const actionsList = picker?.type === 'reward' ? rewards.data?.data : punishments.data?.data;
  const componentRows = components.data?.data ?? [];

  const componentTotal = useMemo(() => {
    return selectedIds.reduce((sum, id) => sum + Number(componentWeights[id] || 0), 0);
  }, [selectedIds, componentWeights]);

  const openActionPicker = (type: 'reward' | 'punishment', grade: EmployeeGradeDetailSetting) => {
    const current = type === 'reward' ? grade.rewards : grade.punishments;
    setSelectedIds((current ?? []).map((item) => item.performanceActionId ?? item.id));
    setPicker({ type, grade });
  };

  const openComponentPicker = (pillar: KPIGradePillarSetting) => {
    const weights: Record<string, number> = {};
    const ids: string[] = [];
    for (const comp of pillar.components ?? []) {
      const compId = comp.performanceComponentId ?? comp.id;
      ids.push(compId);
      weights[compId] = comp.weight ?? 0;
    }
    setComponentWeights(weights);
    setSelectedIds(ids);
    setPicker({ type: 'component', pillar });
  };

  const toggleId = (id: string) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
  };

  const closePicker = () => setPicker(null);

  const savePicker = () => {
    if (!picker) return;
    if (picker.type === 'component') {
      saveComponents.mutate(
        {
          performancePillarId: picker.pillar.performancePillarId ?? picker.pillar.id,
          components: selectedIds.map((id) => ({
            performanceComponentId: id,
            weight: componentWeights[id] ?? 0,
          })),
        },
        { onSuccess: closePicker }
      );
      return;
    }
    saveActions.mutate(
      {
        performanceGradeId: picker.grade.id,
        type: picker.type,
        performanceActionIds: selectedIds,
      },
      { onSuccess: closePicker }
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 border-slate-200"
          onClick={() => router.push('/human-resource/kpi/settings')}
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </Button>
        <div className="font-bold text-slate-900">
          {PERFORMANCE_LABELS.SETTINGS.GRADE_DETAIL_TITLE} {gradeCode}
        </div>
      </div>

      {/* Top Table: Reward & Punishment */}
      <Card className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {PERFORMANCE_LABELS.SETTINGS.REWARD_PUNISHMENT_TITLE}
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">
                  {PERFORMANCE_LABELS.SETTINGS.COLUMNS.GRADE}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {PERFORMANCE_LABELS.SETTINGS.COLUMNS.REWARD}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {PERFORMANCE_LABELS.SETTINGS.COLUMNS.PUNISHMENT}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradeRows.map((grade) => {
                const gLabel = grade.grade ?? grade.code ?? grade.name ?? 'A';
                return (
                  <TableRow key={grade.id}>
                    <TableCell className="w-[120px]">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${getGradeStyle(
                            gLabel
                          )}`}
                        >
                          {gLabel}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {PERFORMANCE_LABELS.SETTINGS.COLUMNS.GRADE} {gLabel}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        {(grade.rewards ?? []).map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                          >
                            {actionLabel(item)}
                            <button
                              type="button"
                              className="text-emerald-500 hover:text-emerald-800"
                              onClick={() => deleteAction.mutate(item.id)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                          onClick={() => openActionPicker('reward', grade)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        {(grade.punishments ?? []).map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                          >
                            {actionLabel(item)}
                            <button
                              type="button"
                              className="text-rose-500 hover:text-rose-800"
                              onClick={() => deleteAction.mutate(item.id)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                          onClick={() => openActionPicker('punishment', grade)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Bottom Cards: Pillars Side by Side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <Card key={pillar.id} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">{pillar.name}</h3>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                onClick={() => openComponentPicker(pillar)}
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700">
                      {PERFORMANCE_LABELS.SETTINGS.COLUMNS.COMPONENT}
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">
                      {PERFORMANCE_LABELS.SETTINGS.COLUMNS.WEIGHT}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(pillar.components ?? []).length > 0 ? (
                    pillar.components?.map((comp) => (
                      <TableRow key={comp.id}>
                        <TableCell className="font-medium text-slate-800">{comp.name}</TableCell>
                        <TableCell className="text-right font-semibold text-slate-900">
                          {comp.weight ?? 0}%
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="py-4 text-center text-xs text-slate-400">
                        {PERFORMANCE_LABELS.SETTINGS.LABELS.NO_COMPONENTS}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        ))}
      </div>

      {/* Right Drawer Panel (Sheet) */}
      <Sheet open={Boolean(picker)} onOpenChange={(open) => !open && closePicker()}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-6">
          <SheetHeader className="pb-4 border-b border-slate-200">
            <SheetTitle className="text-lg font-bold text-slate-900">
              {picker?.type === 'component'
                ? `${PERFORMANCE_LABELS.SETTINGS.PICKER.SELECT_COMPONENT} · ${picker.pillar.name}`
                : picker?.type === 'reward'
                  ? PERFORMANCE_LABELS.SETTINGS.PICKER.SELECT_REWARD
                  : PERFORMANCE_LABELS.SETTINGS.PICKER.SELECT_PUNISHMENT}
            </SheetTitle>
          </SheetHeader>

          {/* Subheader info for Reward & Punishment */}
          {picker?.type !== 'component' && picker?.grade && (
            <div className="flex items-center gap-3 py-4 border-b border-slate-100">
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${getGradeStyle(
                  picker.grade.grade ?? picker.grade.code ?? 'A'
                )}`}
              >
                {picker.grade.grade ?? picker.grade.code ?? 'A'}
              </span>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {PERFORMANCE_LABELS.SETTINGS.COLUMNS.GRADE}{' '}
                  {picker.grade.grade ?? picker.grade.code ?? 'A'}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedIds.length} {PERFORMANCE_LABELS.SETTINGS.PICKER.SELECTED_COUNT}
                </p>
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto py-4">
            {picker?.type === 'component' ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700">
                        {PERFORMANCE_LABELS.SETTINGS.COLUMNS.COMPONENT}
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">
                        {PERFORMANCE_LABELS.SETTINGS.COLUMNS.WEIGHT}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {componentRows.map((comp) => {
                      const compId = comp.id;
                      const isChecked = selectedIds.includes(compId);
                      return (
                        <TableRow key={compId}>
                          <TableCell>
                            <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-800">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => toggleId(compId)}
                                className="data-[state=checked]:bg-cyan-700 data-[state=checked]:border-cyan-700"
                              />
                              <span>{comp.name}</span>
                            </label>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="relative inline-block w-20">
                              <Input
                                type="number"
                                disabled={!isChecked}
                                className="h-8 pr-6 text-right text-xs font-semibold"
                                value={componentWeights[compId] ?? 0}
                                onChange={(e) =>
                                  setComponentWeights((prev) => ({
                                    ...prev,
                                    [compId]: Number(e.target.value),
                                  }))
                                }
                              />
                              <span className="pointer-events-none absolute right-2 top-1.5 text-xs text-slate-400">
                                %
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {componentTotal !== 100 && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs font-medium text-amber-800">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      {PERFORMANCE_LABELS.SETTINGS.PICKER.TOTAL_WEIGHT_WARNING} {picker.pillar.name}{' '}
                      {PERFORMANCE_LABELS.SETTINGS.PICKER.CURRENT_WEIGHT} {componentTotal}%,{' '}
                      {PERFORMANCE_LABELS.SETTINGS.PICKER.ADJUST_TO_100}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {(actionsList ?? []).map((action) => {
                  const actId = action.id;
                  const isChecked = selectedIds.includes(actId);
                  return (
                    <label
                      key={actId}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleId(actId)}
                        className="data-[state=checked]:bg-cyan-700 data-[state=checked]:border-cyan-700"
                      />
                      <span className="text-sm font-medium text-slate-800">
                        {actionLabel(action)}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={closePicker}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {PERFORMANCE_LABELS.SETTINGS.BUTTONS.CANCEL}
            </Button>
            <Button
              className="bg-cyan-700 hover:bg-cyan-800 text-white"
              onClick={savePicker}
              disabled={
                picker?.type === 'component'
                  ? componentTotal !== 100 || saveComponents.isPending
                  : saveActions.isPending
              }
            >
              {PERFORMANCE_LABELS.SETTINGS.BUTTONS.SAVE}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
