'use client';

import { LoginForm } from '../components/LoginForm';
import { useLoginPage } from '../hooks/use-login-page';

export function LoginPage() {
  const { error, isPending, handleSubmit } = useLoginPage();

  return <LoginForm isLoading={isPending} error={error} onSubmit={handleSubmit} />;
}
