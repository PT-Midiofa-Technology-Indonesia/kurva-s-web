'use client';

import { useQuery } from '@tanstack/react-query';
import { getDocumentType } from '../api/get-document-type';
import { DOCUMENT_TYPE_QUERY_KEYS } from './use-document-types';

export function useDocumentType(documentTypeId: string) {
  return useQuery({
    queryKey: DOCUMENT_TYPE_QUERY_KEYS.detail(documentTypeId),
    queryFn: () => getDocumentType(documentTypeId),
    enabled: !!documentTypeId,
    select: (data) => (data ? data.data : null),
  });
}
