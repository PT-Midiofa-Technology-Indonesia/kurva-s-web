import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';

interface SetWarehousePayload {
  warehouseId: string;
}

export async function setProjectWarehouse(
  projectId: string,
  payload: SetWarehousePayload
): Promise<void> {
  await axios.post(getApiPath(`/projects/${projectId}/set-warehouse`), payload);
}

export type { SetWarehousePayload };
