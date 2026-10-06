import { cookies } from 'next/headers';

// Only call this from .server.ts files or Server Components.
// next/headers is server-only and must not be imported on the client.
export async function getServerToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value;
}
