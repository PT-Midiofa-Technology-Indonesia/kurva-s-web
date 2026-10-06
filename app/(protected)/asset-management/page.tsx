import { redirect } from 'next/navigation';
import { ASSET_MANAGEMENT_ROUTES } from '@/domains/asset-management';

export default function Page() {
  redirect(ASSET_MANAGEMENT_ROUTES.ASSET_CATALOG);
}
