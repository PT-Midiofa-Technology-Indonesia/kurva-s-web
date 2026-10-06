'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SegmentedControl } from '@/shared/components/atoms';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import { DEFAULT_TAB, type PayrollTab, TAB_OPTIONS } from '../constants';
import { buildPayrollTabParams } from '../services/build-payroll-tab-params';
import { EmployeeSalaryAdjustmentTab } from './EmployeeSalaryAdjustmentTab';
import { PayrollComponentTab } from './PayrollComponentTab';
import { PayrollDraftTab } from './PayrollDraftTab';
import { SalaryStructureTab } from './SalaryStructureTab';

interface PayrollUrlParams extends BaseQueryParams {
  tab?: string;
}

const VISIBLE_TABS = TAB_OPTIONS;

export function PayrollPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { queryParams } = useQueryParams<PayrollUrlParams>();
  const activeTab = (queryParams.tab as PayrollTab | undefined) ?? DEFAULT_TAB;

  const handleTabChange = (tab: PayrollTab) => {
    const qs = buildPayrollTabParams(searchParams.toString(), tab);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center px-3 h-12 border-b border-slate-200">
        <nav className="flex flex-row items-center gap-1">
          <SegmentedControl
            options={VISIBLE_TABS.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
            value={activeTab}
            onChange={(value) => handleTabChange(value as PayrollTab)}
          />
        </nav>
      </div>

      {activeTab === 'payroll-component' && <PayrollComponentTab />}
      {activeTab === 'salary-structure' && <SalaryStructureTab />}
      {activeTab === 'adjustment' && <EmployeeSalaryAdjustmentTab />}
      {activeTab === 'draft' && <PayrollDraftTab />}
    </div>
  );
}
