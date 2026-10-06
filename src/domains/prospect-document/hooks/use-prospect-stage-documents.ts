'use client';

import { useQuery } from '@tanstack/react-query';
import { getProspectStageDocuments } from '../api/get-prospect-stage-documents';

export const PROSPECT_DOCUMENT_QUERY_KEYS = {
  all: ['prospect-stage-documents'] as const,
  byStage: (stage: string) => [...PROSPECT_DOCUMENT_QUERY_KEYS.all, stage] as const,
};

export function useProspectStageDocuments() {
  return useQuery({
    queryKey: PROSPECT_DOCUMENT_QUERY_KEYS.all,
    queryFn: getProspectStageDocuments,
  });
}
