import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/finance/tax?tab=tax-report');
}
