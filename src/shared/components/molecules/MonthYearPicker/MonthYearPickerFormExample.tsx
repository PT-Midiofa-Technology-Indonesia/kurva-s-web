'use client';

import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { MonthYearPicker } from './MonthYearPicker';

interface FormData {
  reportMonth: Date;
}

export function MonthYearPickerFormExample() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    alert(
      `Selected: ${data.reportMonth?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-[400px]">
      <div>
        <label htmlFor="reportMonth" className="block text-sm font-medium mb-1.5">
          Report Month *
        </label>
        <Controller
          name="reportMonth"
          control={control}
          rules={{ required: 'Report month is required' }}
          render={({ field }) => (
            <MonthYearPicker
              value={field.value}
              onChange={field.onChange}
              error={!!errors.reportMonth}
              placeholder="Select report month"
            />
          )}
        />
        {errors.reportMonth && (
          <p className="mt-1.5 text-sm text-destructive">{errors.reportMonth.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
}
