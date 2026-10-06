'use client';

import { useParams } from 'next/navigation';
import { PurchasePlanningCreatePage } from './PurchasePlanningCreatePage';

export function PurchasePlanningDetailPage() {
  const params = useParams<{ id?: string }>();
  const draftId = params.id ?? '';

  return <PurchasePlanningCreatePage draftId={draftId} startStep={2} />;
}
