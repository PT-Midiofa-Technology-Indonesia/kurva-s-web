'use client';

import { ExternalLink, ImageOff, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { useOfficesInfinite } from '@/domains/office/hooks/use-offices-infinite';
import { useWarehousesInfinite } from '@/domains/warehouse/hooks/use-warehouses-infinite';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { Input } from '@/shared/components/atoms/Input/Input';
import { DetailDrawerTemplate } from '@/shared/components/templates/DetailDrawerTemplate/DetailDrawerTemplate';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { formatDateLong as formatDate } from '@/shared/utils/format';
import {
  ATTENDANCE_LABELS,
  ATTENDANCE_STATUS_BADGE,
  ATTENDANCE_STATUS_OPTIONS,
} from '../constants';
import { useAttendanceDetail } from '../hooks/use-attendance-detail';
import { useUpdateAttendance } from '../hooks/use-update-attendance';
import type { AttendanceStatus, UpdateAttendancePayload } from '../types';

interface AttendanceDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  id: string | null;
  companyId?: string;
  defaultEditing?: boolean;
  onSuccess?: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const config = ATTENDANCE_STATUS_BADGE[status] ?? {
    label: status,
    variant: 'secondary' as const,
  };
  return <Badge variant={config.variant as any}>{config.label}</Badge>;
}

/** Clickable selfie thumbnail — opens full image in a new tab. */
function SelfieSlot({
  label,
  url,
  emptyLabel,
  openNewTabLabel,
}: {
  label: string;
  url?: string | null;
  emptyLabel: string;
  openNewTabLabel: string;
}) {
  if (!url) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{label}</Label>
        <div className="flex aspect-4/3 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400">
          <ImageOff className="h-6 w-6" />
          <span className="text-xs">{emptyLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-normal text-slate-500">{label}</Label>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block aspect-4/3 w-full overflow-hidden rounded-lg border border-slate-200"
        aria-label={`${openNewTabLabel} (${label})`}
      >
        {/* biome-ignore lint/performance/noImgElement: remote selfie URL, not a next/image-eligible local asset */}
        <img
          src={url}
          alt={label}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/0 transition-colors group-hover:bg-slate-950/30">
          <ExternalLink className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </a>
    </div>
  );
}

export function AttendanceDetailDrawer({
  open,
  onClose,
  id,
  companyId,
  defaultEditing = false,
  onSuccess,
}: AttendanceDetailDrawerProps) {
  const { data: attendance, isLoading } = useAttendanceDetail(id);
  const { mutate: updateAttendance, isPending: isUpdating } = useUpdateAttendance();
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const labels = ATTENDANCE_LABELS.DETAIL;

  // Form state
  const [formStatus, setFormStatus] = useState<AttendanceStatus>('present');
  const [formLocationType, setFormLocationType] = useState('');
  const [formLocationId, setFormLocationId] = useState('');
  const [formCheckIn, setFormCheckIn] = useState('');
  const [formCheckOut, setFormCheckOut] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const {
    options: officeOptions,
    isLoading: loadingOffices,
    hasMore: moreOffices,
    loadMore: loadMoreOffices,
  } = useOfficesInfinite();
  const {
    options: warehouseOptions,
    isLoading: loadingWarehouses,
    hasMore: moreWarehouses,
    loadMore: loadMoreWarehouses,
  } = useWarehousesInfinite();

  const isFormValid = (() => {
    const isNoTimeStatus = ['sick', 'leave', 'dayoff', 'absent'].includes(formStatus);
    const s = z.object({
      status: z.string().min(1),
      locationType: z.string().min(1),
      locationId: z.string().min(1),
      checkIn: isNoTimeStatus ? z.string().optional() : z.string().min(1),
      checkOut: isNoTimeStatus ? z.string().optional() : z.string().min(1),
    });
    return s.safeParse({
      status: formStatus,
      locationType: formLocationType,
      locationId: formLocationId,
      checkIn: formCheckIn,
      checkOut: formCheckOut,
    }).success;
  })();

  useEffect(() => {
    if (open) {
      setIsEditing(defaultEditing);
    }
  }, [open, defaultEditing]);

  useEffect(() => {
    if (attendance) {
      setFormStatus(attendance.status as AttendanceStatus);
      setFormLocationType(attendance.locationType);
      setFormLocationId(attendance.locationId ?? '');
      setFormCheckIn(attendance.checkIn ?? '');
      setFormCheckOut(attendance.checkOut ?? '');
      setFormNotes(attendance.notes ?? '');
    }
  }, [attendance]);

  const handleStatusChange = (val: string) => {
    const statusVal = val as AttendanceStatus;
    setFormStatus(statusVal);
    if (['sick', 'leave', 'dayoff', 'absent'].includes(statusVal)) {
      setFormCheckIn('');
      setFormCheckOut('');
    }
  };

  const handleLocationTypeChange = (val: string) => {
    setFormLocationType(val);
    setFormLocationId('');
  };

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!id || !attendance || !companyId) return;

    const isNoTimeStatus = ['sick', 'leave', 'dayoff', 'absent'].includes(formStatus);

    const payload: UpdateAttendancePayload = {
      employeeId: attendance.employeeId,
      attendanceDate: attendance.attendanceDate,
      checkIn: isNoTimeStatus || !formCheckIn ? null : formCheckIn,
      checkOut: isNoTimeStatus || !formCheckOut ? null : formCheckOut,
      status: formStatus,
      locationType: formLocationType,
      locationId: formLocationId || null,
      projectId: attendance.projectId,
      timezone: attendance.timezone,
      notes: formNotes || null,
      checkInLatitude: attendance.checkInLatitude,
      checkInLongitude: attendance.checkInLongitude,
      checkInDistanceMeters: attendance.checkInDistanceMeters,
      checkOutLatitude: attendance.checkOutLatitude,
      checkOutLongitude: attendance.checkOutLongitude,
      checkOutDistanceMeters: attendance.checkOutDistanceMeters,
      isActive: attendance.isActive,
    };

    updateAttendance(
      { id, companyId, payload },
      {
        onSuccess: () => {
          setIsEditing(false);
          onSuccess?.();
        },
      }
    );
  }, [
    id,
    attendance,
    companyId,
    formStatus,
    formLocationType,
    formLocationId,
    formCheckIn,
    formCheckOut,
    formNotes,
    updateAttendance,
    onSuccess,
  ]);

  const drawerTitle = isEditing ? labels.EDIT_PAGE_TITLE : labels.PAGE_TITLE;

  // ── Loading state ──
  if (isLoading) {
    return (
      <DetailDrawerTemplate
        open={open}
        onClose={onClose}
        title={drawerTitle}
        closeLabel={labels.BUTTONS.CLOSE}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </DetailDrawerTemplate>
    );
  }

  if (!attendance) {
    return (
      <DetailDrawerTemplate
        open={open}
        onClose={onClose}
        title={drawerTitle}
        closeLabel={labels.BUTTONS.CLOSE}
      >
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-500">Data tidak ditemukan</p>
        </div>
      </DetailDrawerTemplate>
    );
  }

  const empName = attendance.employee?.fullName || attendance.employeeName || '-';
  const empCode = attendance.employee?.code || attendance.employeeCode || '-';

  const renderViewMode = () => (
    <>
      {/* Date + Name row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.DATE}</Label>
          <p className="text-sm font-medium text-slate-950">
            {formatDate(attendance.attendanceDate)}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.NAME}</Label>
          <p className="text-sm font-medium text-slate-950">{empName}</p>
        </div>
      </div>

      {/* Code + Status row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.CODE}</Label>
          <p className="text-sm font-medium text-slate-950">{empCode}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.STATUS}</Label>
          <StatusBadge status={attendance.status} />
        </div>
      </div>

      {/* Project */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.PROJECT}</Label>
        <p className="text-sm font-medium text-slate-950">
          {attendance.project?.name || attendance.projectName || '-'}
        </p>
      </div>

      {/* Timezone + Work Hour */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.TIMEZONE}</Label>
          <p className="text-sm font-medium text-slate-950">
            {attendance.workHourSetting?.timezone ?? attendance.timezone ?? '-'}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.WORK_HOUR}</Label>
          <p className="text-sm font-medium text-slate-950">
            {attendance.workHourSetting
              ? `${attendance.workHourSetting.startTime}-${attendance.workHourSetting.endTime}`
              : '-'}
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.LOCATION}</Label>
        <p className="text-sm font-medium text-slate-950">
          {attendance.location?.name || attendance.locationName || attendance.locationType || '-'}
        </p>
      </div>

      {/* Check in + Check out */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.CHECK_IN}</Label>
          <p
            className={`text-sm font-medium ${attendance.checkIn === '00:00' ? 'text-red-500' : 'text-green-600'}`}
          >
            {attendance.checkIn}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.CHECK_OUT}</Label>
          <p
            className={`text-sm font-medium ${attendance.checkOut === '00:00' ? 'text-red-500' : 'text-green-600'}`}
          >
            {attendance.checkOut}
          </p>
        </div>
      </div>

      {/* Selfie photos */}
      {(attendance.selfies?.checkIn || attendance.selfies?.checkOut) && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.SELFIES.TITLE}</Label>
          <div className="grid grid-cols-2 gap-4">
            <SelfieSlot
              label={labels.SELFIES.CHECK_IN}
              url={attendance.selfies?.checkIn}
              emptyLabel={labels.SELFIES.EMPTY}
              openNewTabLabel={labels.SELFIES.OPEN_NEW_TAB}
            />
            <SelfieSlot
              label={labels.SELFIES.CHECK_OUT}
              url={attendance.selfies?.checkOut}
              emptyLabel={labels.SELFIES.EMPTY}
              openNewTabLabel={labels.SELFIES.OPEN_NEW_TAB}
            />
          </div>
        </div>
      )}

      {/* Late + Early Leave */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.LATE}</Label>
          <p className="text-sm font-medium text-slate-950">
            {String(attendance.lateMinutes).padStart(2, '0')}:00
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.EARLY_LEAVE}</Label>
          <p className="text-sm font-medium text-slate-950">
            {String(attendance.earlyLeaveMinutes).padStart(2, '0')}:00
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.NOTES}</Label>
        <p className="text-sm font-medium text-slate-950">{attendance.notes ?? '-'}</p>
      </div>
    </>
  );

  const renderEditMode = () => (
    <>
      {/* Date */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{ATTENDANCE_LABELS.FORM.DATE}</Label>
        <Input value={formatDate(attendance.attendanceDate)} disabled />
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">
          {ATTENDANCE_LABELS.FORM.STATUS}
        </Label>
        <AsyncSelect
          options={ATTENDANCE_STATUS_OPTIONS as any}
          value={formStatus}
          onChange={(v) => handleStatusChange(v as string)}
          isSearchable={false}
        />
      </div>

      {/* Name + Code row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {ATTENDANCE_LABELS.FORM.NAME}
          </Label>
          <Input value={empName} disabled />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {ATTENDANCE_LABELS.FORM.CODE}
          </Label>
          <Input value={empCode} disabled />
        </div>
      </div>

      {/* Location type */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">
          Location Type<span className="text-cyan-500 ml-0.5">*</span>
        </Label>
        <AsyncSelect
          options={[
            { value: 'Office', label: 'Office' },
            { value: 'Warehouse', label: 'Warehouse' },
          ]}
          value={formLocationType}
          onChange={(v) => handleLocationTypeChange((v as string) ?? '')}
          isSearchable={false}
        />
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">
          Location<span className="text-cyan-500 ml-0.5">*</span>
        </Label>
        {formLocationType === 'Office' && (
          <AsyncSelect
            options={officeOptions}
            value={formLocationId}
            onChange={(v) => setFormLocationId((v as string) ?? '')}
            isSearchable={true}
            isLoading={loadingOffices}
            onScrollToBottom={moreOffices ? () => loadMoreOffices() : undefined}
          />
        )}
        {formLocationType === 'Warehouse' && (
          <AsyncSelect
            options={warehouseOptions}
            value={formLocationId}
            onChange={(v) => setFormLocationId((v as string) ?? '')}
            isSearchable={true}
            isLoading={loadingWarehouses}
            onScrollToBottom={moreWarehouses ? () => loadMoreWarehouses() : undefined}
          />
        )}
        {(!formLocationType ||
          (formLocationType !== 'Office' && formLocationType !== 'Warehouse')) && (
          <Input disabled placeholder="Select Location Type first" />
        )}
      </div>

      {/* Check in */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">
          {ATTENDANCE_LABELS.FORM.CHECK_IN}
          <span className="text-cyan-500 ml-0.5">*</span>
        </Label>
        <Input type="time" value={formCheckIn} onChange={(e) => setFormCheckIn(e.target.value)} />
      </div>

      {/* Check out */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">
          {ATTENDANCE_LABELS.FORM.CHECK_OUT}
          <span className="text-cyan-500 ml-0.5">*</span>
        </Label>
        <Input type="time" value={formCheckOut} onChange={(e) => setFormCheckOut(e.target.value)} />
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{ATTENDANCE_LABELS.FORM.NOTES}</Label>
        <textarea
          value={formNotes}
          onChange={(e) => setFormNotes(e.target.value)}
          className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          placeholder="Notes"
          rows={4}
        />
      </div>
    </>
  );

  return (
    <DetailDrawerTemplate
      open={open}
      onClose={onClose}
      title={drawerTitle}
      closeLabel={isEditing ? labels.BUTTONS.CANCEL : labels.BUTTONS.CLOSE}
      onEdit={isEditing ? undefined : handleEditClick}
      editLabel={labels.BUTTONS.EDIT}
      customFooter={
        isEditing ? (
          <Button
            onClick={handleSave}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isUpdating || !isFormValid}
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : labels.BUTTONS.SAVE}
          </Button>
        ) : undefined
      }
    >
      {isEditing ? renderEditMode() : renderViewMode()}
    </DetailDrawerTemplate>
  );
}
