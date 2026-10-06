import { useQuery } from '@tanstack/react-query';
import { getDocumentModules } from '../api/document-modules';

export const DOCUMENT_MODULE_QUERY_KEY = 'document-modules';

export function useDocumentModules() {
  return useQuery({
    queryKey: [DOCUMENT_MODULE_QUERY_KEY],
    queryFn: getDocumentModules,
  });
}
