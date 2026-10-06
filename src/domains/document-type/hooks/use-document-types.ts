import { useQuery } from '@tanstack/react-query';
import { type GetDocumentTypesParams, getDocumentTypes } from '../api/get-document-types';

export const DOCUMENT_TYPE_QUERY_KEYS = {
  all: ['document-types'] as const,
  lists: () => [...DOCUMENT_TYPE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...DOCUMENT_TYPE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...DOCUMENT_TYPE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...DOCUMENT_TYPE_QUERY_KEYS.details(), id] as const,
  infinite: () => ['document-types-infinite'] as const,
};

export function useDocumentTypes(params?: GetDocumentTypesParams) {
  return useQuery({
    queryKey: [...DOCUMENT_TYPE_QUERY_KEYS.all, params],
    queryFn: () => getDocumentTypes(params),
    placeholderData: (previousData) => previousData,
  });
}
