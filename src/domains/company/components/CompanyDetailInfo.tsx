'use client';

import { Pencil } from 'lucide-react';
import { Button } from '@/components/atoms';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { formatPhone } from '@/shared/utils/masks';
import { COMPANY_LABELS } from '../constants';
import type { Company } from '../types';

interface CompanyDetailInfoProps {
  company: Company;
  onEdit: () => void;
  onStatusChange?: (isActive: boolean) => void;
}

export function CompanyDetailInfo({ company, onEdit, onStatusChange }: CompanyDetailInfoProps) {
  return (
    <div className="rounded-lg border bg-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          {COMPANY_LABELS.DETAIL.INFO_CARD_TITLE}
        </h2>
        <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          {COMPANY_LABELS.DETAIL.EDIT_BUTTON}
        </Button>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-normal text-slate-400">
            {COMPANY_LABELS.DETAIL.FIELDS.PROJECT_CAPABILITIES}
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {company.projectCapabilities?.length ? (
              company.projectCapabilities.map((cap) => (
                <span
                  key={cap.id}
                  className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                >
                  {cap.name}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">-</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-normal text-slate-400">
              {COMPANY_LABELS.DETAIL.FIELDS.CODE}
            </Label>
            <p className="text-sm font-medium text-slate-900">{company.code}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-normal text-slate-400">
              {COMPANY_LABELS.DETAIL.FIELDS.NAME}
            </Label>
            <p className="text-sm font-medium text-slate-900">{company.name}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-normal text-slate-400">
            {COMPANY_LABELS.DETAIL.FIELDS.NPWP}
          </Label>
          <p className="text-sm font-medium text-slate-900">{company.npwp || '-'}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-normal text-slate-400">
            {COMPANY_LABELS.DETAIL.FIELDS.SIUP_NUMBER}
          </Label>
          <p className="text-sm font-medium text-slate-900">{company.siupNumber || '-'}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-normal text-slate-400">
              {COMPANY_LABELS.DETAIL.FIELDS.PHONE}
            </Label>
            <p className="text-sm font-medium text-slate-900">
              {formatPhone(company.phone) || '-'}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-normal text-slate-400">
              {COMPANY_LABELS.DETAIL.FIELDS.EMAIL}
            </Label>
            <p className="text-sm font-medium text-slate-900">{company.email || '-'}</p>
          </div>
        </div>

        <div className="border-t pt-5 space-y-5">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-slate-400">
                {COMPANY_LABELS.DETAIL.FIELDS.PROVINCE}
              </Label>
              <p className="text-sm font-medium text-slate-900">{company.province?.name ?? '-'}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-slate-400">
                {COMPANY_LABELS.DETAIL.FIELDS.CITY}
              </Label>
              <p className="text-sm font-medium text-slate-900">{company.city?.name ?? '-'}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-slate-400">
                {COMPANY_LABELS.DETAIL.FIELDS.DISTRICT}
              </Label>
              <p className="text-sm font-medium text-slate-900">{company.district?.name ?? '-'}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-normal text-slate-400">
              {COMPANY_LABELS.DETAIL.FIELDS.ADDRESS_DETAIL}
            </Label>
            <p className="text-sm font-medium text-slate-900">{company.addressDetail || '-'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-normal text-slate-400">
            {COMPANY_LABELS.DETAIL.FIELDS.STATUS}
          </Label>
          <div className="flex items-center gap-2">
            <Switch
              checked={company.isActive}
              onCheckedChange={onStatusChange}
              className="data-[state=checked]:bg-brand-600"
            />
            <span className="text-sm font-medium text-slate-900">
              {company.isActive
                ? COMPANY_LABELS.DETAIL.STATUS_ACTIVE
                : COMPANY_LABELS.DETAIL.STATUS_INACTIVE}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
