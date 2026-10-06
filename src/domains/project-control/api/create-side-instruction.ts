import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';

export interface CreateSideInstructionResponse {
  id: string;
  parentId: string;
  isSideInstruction: boolean;
  code: string;
  name: string;
}

export async function createSideInstruction(
  projectId: string
): Promise<{ data: CreateSideInstructionResponse }> {
  const { data } = await axios.post(getApiPath(`/projects/${projectId}/side-instructions`));
  return data;
}
