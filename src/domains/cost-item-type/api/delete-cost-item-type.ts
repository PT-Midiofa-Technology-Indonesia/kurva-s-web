import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import { api } from '@/shared/lib/axios';

export async function deleteCostItemType(id: string): Promise<void> {
  try {
    await api.delete(getApiPath(`/cost-item-types/${id}`));
  } catch (error) {
    handleApiError(error);
  }
}
