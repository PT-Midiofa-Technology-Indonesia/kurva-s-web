'use client';

import { BOQPlanningDetail } from '../BOQPlanning/BOQPlanningDetail';
import type { BOQPlanningProps } from '../types/boq-planning.types';

export type BOQFinalDetailProps = Omit<BOQPlanningProps, 'onChange' | 'readOnly'> & {
  /** Optional — read-only mode never emits changes, but kept for API parity. */
  onChange?: BOQPlanningProps['onChange'];
};

const noop = () => {};

/** Read-only preview of a BOQ plan. Thin wrapper over BOQPlanningDetail with readOnly forced. */
export function BOQFinalDetail({
  onChange = noop,
  title = 'BoQ Final',
  labels,
  ...props
}: BOQFinalDetailProps) {
  return (
    <BOQPlanningDetail {...props} title={title} onChange={onChange} readOnly labels={labels} />
  );
}

export default BOQFinalDetail;
