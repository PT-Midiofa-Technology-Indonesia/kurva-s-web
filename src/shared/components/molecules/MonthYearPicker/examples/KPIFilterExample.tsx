/**
 * Example: Using MonthYearPicker in a KPI Filter
 *
 * This example shows how to integrate MonthYearPicker in a domain context
 * for filtering KPI data by month/year.
 */

'use client';

import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MonthYearPicker } from '@/shared/components/molecules/MonthYearPicker';

interface KPIFilterFormProps {
  onFilterApply: (month: Date) => void;
}

export function KPIFilterForm({ onFilterApply }: KPIFilterFormProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>();

  const handleApply = () => {
    if (selectedMonth) {
      onFilterApply(selectedMonth);
    }
  };

  const handleReset = () => {
    setSelectedMonth(undefined);
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <div>
        <h3 className="text-sm font-medium mb-3">Filter KPI by Month</h3>

        <div className="space-y-2">
          <label htmlFor="kpi-month" className="block text-sm text-muted-foreground">
            Report Period
          </label>
          <MonthYearPicker
            value={selectedMonth}
            onChange={setSelectedMonth}
            placeholder="Select month"
            fromYear={2020}
            toYear={new Date().getFullYear()}
          />
        </div>
      </div>

      {selectedMonth && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <p className="font-medium">Selected Period:</p>
          <p className="text-muted-foreground">{format(selectedMonth, 'MMMM yyyy')}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleApply} disabled={!selectedMonth} className="flex-1">
          Apply Filter
        </Button>
        <Button variant="outline" onClick={handleReset} disabled={!selectedMonth}>
          Reset
        </Button>
      </div>
    </div>
  );
}

/**
 * Usage in a page:
 *
 * ```tsx
 * 'use client';
 *
 * import { KPIFilterForm } from './KPIFilterForm';
 * import { useKPIData } from '@/domains/kpi/hooks/use-kpi-data';
 *
 * export function KPIPage() {
 *   const [filterMonth, setFilterMonth] = useState<Date>();
 *   const { data, isLoading } = useKPIData({ month: filterMonth });
 *
 *   return (
 *     <div className="grid grid-cols-[300px_1fr] gap-6">
 *       <aside>
 *         <KPIFilterForm onFilterApply={setFilterMonth} />
 *       </aside>
 *       <main>
 *         {isLoading ? <Skeleton /> : <KPITable data={data} />}
 *       </main>
 *     </div>
 *   );
 * }
 * ```
 */
