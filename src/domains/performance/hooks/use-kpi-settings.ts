'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/lib/toast';
import {
  deleteGradeAction,
  type GetEmployeeGradesParams,
  getCompanySettings,
  getEmployeeGradeSettings,
  getEmployeeGrades,
  getPerformanceActions,
  getPerformanceGrades,
  getPillarComponents,
  type KPISettingsCompanyParams,
  saveGradeActions,
  savePillarComponents,
  updateCompanySettings,
} from '../api/kpi-settings';
import type {
  KPICompanySettingsPayload,
  SaveGradeActionsPayload,
  SavePillarComponentsPayload,
} from '../types';

export const KPI_SETTINGS_QUERY_KEYS = {
  all: ['performance', 'kpi-settings'] as const,
  companySettings: (params: KPISettingsCompanyParams) =>
    [...KPI_SETTINGS_QUERY_KEYS.all, 'company-settings', params] as const,
  employeeGrades: (params: GetEmployeeGradesParams) =>
    [...KPI_SETTINGS_QUERY_KEYS.all, 'employee-grades', params] as const,
  gradeSettings: (gradeId: string, params: KPISettingsCompanyParams) =>
    [...KPI_SETTINGS_QUERY_KEYS.all, 'employee-grades', gradeId, 'settings', params] as const,
  grades: (params: KPISettingsCompanyParams) =>
    [...KPI_SETTINGS_QUERY_KEYS.all, 'grades', params] as const,
  actions: (type: 'reward' | 'punishment', params: KPISettingsCompanyParams) =>
    [...KPI_SETTINGS_QUERY_KEYS.all, 'actions', type, params] as const,
  pillarComponents: (pillarId: string, params: KPISettingsCompanyParams) =>
    [...KPI_SETTINGS_QUERY_KEYS.all, 'pillars', pillarId, 'components', params] as const,
};

export function useCompanySettings(params: KPISettingsCompanyParams) {
  return useQuery({
    queryKey: KPI_SETTINGS_QUERY_KEYS.companySettings(params),
    queryFn: () => getCompanySettings(params),
    enabled: Boolean(params.companyId),
  });
}

export function useEmployeeGrades(params: GetEmployeeGradesParams) {
  return useQuery({
    queryKey: KPI_SETTINGS_QUERY_KEYS.employeeGrades(params),
    queryFn: () => getEmployeeGrades(params),
    enabled: Boolean(params.companyId),
  });
}

export function useEmployeeGradeSettings(gradeId: string, params: KPISettingsCompanyParams) {
  return useQuery({
    queryKey: KPI_SETTINGS_QUERY_KEYS.gradeSettings(gradeId, params),
    queryFn: () => getEmployeeGradeSettings(gradeId, params),
    enabled: Boolean(gradeId && params.companyId),
  });
}

export function usePerformanceGrades(params: KPISettingsCompanyParams) {
  return useQuery({
    queryKey: KPI_SETTINGS_QUERY_KEYS.grades(params),
    queryFn: () => getPerformanceGrades(params),
    enabled: Boolean(params.companyId),
  });
}

export function usePerformanceActions(
  type: 'reward' | 'punishment',
  params: KPISettingsCompanyParams
) {
  return useQuery({
    queryKey: KPI_SETTINGS_QUERY_KEYS.actions(type, params),
    queryFn: () => getPerformanceActions(type, params),
    enabled: Boolean(params.companyId),
  });
}

export function usePillarComponents(pillarId: string, params: KPISettingsCompanyParams) {
  return useQuery({
    queryKey: KPI_SETTINGS_QUERY_KEYS.pillarComponents(pillarId, params),
    queryFn: () => getPillarComponents(pillarId, params),
    enabled: Boolean(pillarId && params.companyId),
  });
}

export function useUpdateCompanySettings(companyId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: KPICompanySettingsPayload) =>
      updateCompanySettings({ ...payload, companyId }),
    onSuccess: () => {
      toast.success({ title: 'Setting KPI berhasil disimpan' });
      queryClient.invalidateQueries({ queryKey: KPI_SETTINGS_QUERY_KEYS.all });
    },
  });
}

export function useSaveGradeActions(gradeId: string, companyId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveGradeActionsPayload) =>
      saveGradeActions(gradeId, { ...payload, companyId }),
    onSuccess: () => {
      toast.success({ title: 'Reward/punishment berhasil disimpan' });
      queryClient.invalidateQueries({ queryKey: KPI_SETTINGS_QUERY_KEYS.all });
    },
  });
}

export function useDeleteGradeAction(gradeId: string, companyId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actionId: string) => deleteGradeAction(gradeId, actionId, { companyId }),
    onSuccess: () => {
      toast.success({ title: 'Reward/punishment berhasil dihapus' });
      queryClient.invalidateQueries({ queryKey: KPI_SETTINGS_QUERY_KEYS.all });
    },
  });
}

export function useSavePillarComponents(gradeId: string, companyId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SavePillarComponentsPayload) =>
      savePillarComponents(gradeId, { ...payload, companyId }),
    onSuccess: () => {
      toast.success({ title: 'Komponen KPI berhasil disimpan' });
      queryClient.invalidateQueries({ queryKey: KPI_SETTINGS_QUERY_KEYS.all });
    },
  });
}
