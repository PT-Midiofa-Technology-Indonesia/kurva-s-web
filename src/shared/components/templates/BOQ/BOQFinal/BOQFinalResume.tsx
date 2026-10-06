'use client';

import { BOQPlanningResume, type BOQPlanningResumeProps } from '../BOQPlanning/BOQPlanningResume';

export type BOQFinalResumeProps = Omit<
  BOQPlanningResumeProps,
  'onMaterialRowsChange' | 'onEquipmentRowsChange' | 'readOnly'
> & {
  /** Kept for API parity — read-only never emits changes. */
  onMaterialRowsChange?: BOQPlanningResumeProps['onMaterialRowsChange'];
  onEquipmentRowsChange?: BOQPlanningResumeProps['onEquipmentRowsChange'];
};

/** Read-only cost-summary preview. Thin wrapper over BOQPlanningResume with readOnly forced. */
export function BOQFinalResume(props: BOQFinalResumeProps) {
  return <BOQPlanningResume {...props} readOnly />;
}

export default BOQFinalResume;
