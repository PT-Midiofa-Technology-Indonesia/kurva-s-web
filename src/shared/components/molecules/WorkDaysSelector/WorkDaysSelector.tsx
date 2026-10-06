'use client';

import { Label } from '@/shared/components/ui/label';

const DAYS = [
  { key: 'senin', label: 'Senin' },
  { key: 'selasa', label: 'Selasa' },
  { key: 'rabu', label: 'Rabu' },
  { key: 'kamis', label: 'Kamis' },
  { key: 'jumat', label: 'Jumat' },
  { key: 'sabtu', label: 'Sabtu' },
  { key: 'minggu', label: 'Minggu' },
] as const;

export interface WorkDaysSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  label?: string;
  disabled?: boolean;
}

export function WorkDaysSelector({
  value = [],
  onChange,
  label = 'Hari Kerja',
  disabled = false,
}: WorkDaysSelectorProps) {
  const selectedDays = new Set(value);

  const handleToggleDay = (day: string) => {
    if (disabled) return;
    const next = new Set(selectedDays);
    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
    }
    onChange?.(Array.from(next));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => (
          <label
            key={day.key}
            className={`px-3 py-1.5 rounded-md text-sm border cursor-pointer transition-colors ${
              selectedDays.has(day.key)
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={selectedDays.has(day.key)}
              onChange={() => handleToggleDay(day.key)}
              disabled={disabled}
            />
            {day.label}
          </label>
        ))}
      </div>
    </div>
  );
}
