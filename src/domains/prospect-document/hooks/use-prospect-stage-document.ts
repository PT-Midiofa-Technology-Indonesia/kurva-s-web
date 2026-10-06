'use client';

import { useQuery } from '@tanstack/react-query';
import { getProspectStageDocument } from '../api/get-prospect-stage-document';
import { PROSPECT_DOCUMENT_QUERY_KEYS } from './use-prospect-stage-documents';

export function useProspectStageDocument(stage: string | null) {
  return useQuery({
    queryKey: PROSPECT_DOCUMENT_QUERY_KEYS.byStage(stage ?? ''),
    queryFn: () => getProspectStageDocument(stage!),
    enabled: !!stage,
  });
}
