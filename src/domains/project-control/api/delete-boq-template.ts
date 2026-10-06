import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function deleteBOQTemplate(templateId: string): Promise<void> {
  try {
    await api.delete(getApiPath(`/boq-templates/${templateId}`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
