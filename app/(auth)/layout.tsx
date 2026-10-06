import { AuthLayout } from '@/components/templates/AuthLayout';

export default function AuthRouteLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
