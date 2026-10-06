import { Calendar as CalendarIcon } from 'lucide-react';
import { AsyncSelect, type SelectValue } from '@/shared/components/atoms';
import { Button } from '@/shared/components/ui/button';

interface Option {
  value: string;
  label: string;
}

interface BillingListFiltersProps {
  billingTypeOptions: Option[];
  billingStatusOptions: Option[];
  onBillingTypeChange: (value: SelectValue) => void;
  onStatusChange: (value: SelectValue) => void;
  onViewCalendar?: () => void;
}

export function BillingListFilters({
  billingTypeOptions,
  billingStatusOptions,
  onBillingTypeChange,
  onStatusChange,
  onViewCalendar,
}: BillingListFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <AsyncSelect
        className="w-40"
        options={billingTypeOptions}
        placeholder="Type"
        isSearchable={false}
        onChange={onBillingTypeChange}
        isClearable
      />
      <AsyncSelect
        className="w-48"
        options={billingStatusOptions}
        placeholder="Status"
        isSearchable={false}
        onChange={onStatusChange}
        isClearable
      />
      <Button className="h-9 bg-teal-600 hover:bg-teal-700 text-white" onClick={onViewCalendar}>
        <CalendarIcon className="mr-2 h-4 w-4" />
        View Calender
      </Button>
    </div>
  );
}
