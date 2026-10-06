import { api } from '@/shared/lib/axios';
import type { EnumEndpoint, EnumResponse } from '@/shared/types/enum';
import { getApiPath } from '../lib/api-config';

export const enumApi = {
  get: async (endpoint: EnumEndpoint): Promise<EnumResponse> => {
    const response = await api.get<EnumResponse>(getApiPath(`/enums/${endpoint}`));
    return response.data;
  },
};
