'use client';

import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Button, Input, InputNumber, Switch } from '@/shared/components/atoms';
import { Label } from '@/shared/components/ui/label';
import { LEAVE_LABELS } from '../constants';
import type { LeaveSettingsFormValues } from '../schemas';

const EMPTY_LEAVE_TYPE = {
  id: '',
  leaveType: '',
  annualQuota: 0,
  requiresApproval: false,
  isActive: true,
};

export function LeaveTypeSettingsSection() {
  const { control, register } = useFormContext<LeaveSettingsFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'leaveTypes',
  });

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-slate-950">
          {LEAVE_LABELS.SETTINGS.LEAVE_TYPES.TITLE}
        </h2>
        <p className="text-sm text-slate-500">{LEAVE_LABELS.SETTINGS.LEAVE_TYPES.DESCRIPTION}</p>
      </div>

      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
            {LEAVE_LABELS.SETTINGS.LEAVE_TYPES.EMPTY}
          </div>
        ) : null}
        {fields.map((field, index) => {
          return (
            <div
              key={field.id}
              className="rounded-lg border border-slate-200 bg-white p-4 space-y-4"
            >
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6">
                  <Input
                    id={`leave-type-kind-${index}`}
                    label={LEAVE_LABELS.SETTINGS.LEAVE_TYPES.LEAVE_TYPE}
                    placeholder={LEAVE_LABELS.SETTINGS.LEAVE_TYPES.LEAVE_TYPE_PLACEHOLDER}
                    {...register(`leaveTypes.${index}.leaveType`)}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <Label htmlFor={`leave-type-quota-${index}`} className="mb-2 block">
                    {LEAVE_LABELS.SETTINGS.LEAVE_TYPES.QUOTA}
                  </Label>
                  <Controller
                    control={control}
                    name={`leaveTypes.${index}.annualQuota`}
                    render={({ field: numberField }) => (
                      <InputNumber
                        id={`leave-type-quota-${index}`}
                        value={numberField.value}
                        onChange={(value) => numberField.onChange(value ?? 0)}
                        decimalPlaces={0}
                        showLabel={false}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-6">
                  <Controller
                    control={control}
                    name={`leaveTypes.${index}.requiresApproval`}
                    render={({ field: switchField }) => (
                      <Switch
                        checked={switchField.value}
                        onCheckedChange={switchField.onChange}
                        label={LEAVE_LABELS.SETTINGS.LEAVE_TYPES.REQUIRES_APPROVAL}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`leaveTypes.${index}.isActive`}
                    render={({ field: switchField }) => (
                      <Switch
                        checked={switchField.value}
                        onCheckedChange={switchField.onChange}
                        label={LEAVE_LABELS.SETTINGS.LEAVE_TYPES.ACTIVE}
                      />
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  {LEAVE_LABELS.SETTINGS.LEAVE_TYPES.REMOVE}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="outline" onClick={() => append(EMPTY_LEAVE_TYPE)}>
        {LEAVE_LABELS.SETTINGS.LEAVE_TYPES.ADD}
      </Button>
    </div>
  );
}
