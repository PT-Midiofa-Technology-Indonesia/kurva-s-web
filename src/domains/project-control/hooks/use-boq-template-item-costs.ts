import { useQuery } from '@tanstack/react-query';
import { getBOQTemplateItemCosts } from '../api/get-boq-template-item-costs';

export function useBOQTemplateItemCosts(
  templateId: string,
  itemId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['boq-template-item-costs', templateId, itemId],
    queryFn: () => getBOQTemplateItemCosts(templateId, itemId),
    enabled: options?.enabled ?? true,
  });
}
