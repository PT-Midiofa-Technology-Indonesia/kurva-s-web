import { getApiPath } from '@/shared/lib/api-config';
import axios from '@/shared/lib/axios';
import type { CreateUserPayload, User } from '../types';

export type { CreateUserPayload };

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await axios.post(getApiPath('/users'), payload);

  return data.data;
}
