'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/molecules/Alert';
import { FormGenerator } from '@/shared/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator/types';
import { maskPhone, maxChars, noWhitespace } from '@/shared/utils/masks';
import { AUTH_LABELS } from '../constants';
import type { UseLoginError } from '../hooks/use-login';
import { type LoginFormInput, loginFormSchema, toLoginCredentials } from '../schemas';
import type { LoginCredentials } from '../types';

// ─── Login tab toggle ────────────────────────────────────────────────────────

function LoginMethodToggle() {
  const { setValue, watch, setFocus } = useFormContext<LoginFormInput>();
  const loginMethod = watch('loginMethod');

  useEffect(() => {
    setFocus(loginMethod === 'email' ? 'email' : 'phone');
  }, [loginMethod, setFocus]);

  return (
    <div className="flex rounded-lg bg-slate-100 p-1">
      <button
        type="button"
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          loginMethod === 'email'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
        onClick={() => setValue('loginMethod', 'email')}
      >
        Email
      </button>
      <button
        type="button"
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          loginMethod === 'phone'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
        onClick={() => setValue('loginMethod', 'phone')}
      >
        No. HP
      </button>
    </div>
  );
}

// ─── Submit button ───────────────────────────────────────────────────────────

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const {
    formState: { isValid },
  } = useFormContext<LoginFormInput>();

  return (
    <Button
      type="submit"
      className="w-full bg-brand-600 hover:bg-brand-700 text-slate-50"
      isLoading={isLoading}
      disabled={!isValid || isLoading}
    >
      {AUTH_LABELS.LOGIN.SUBMIT}
    </Button>
  );
}

// ─── LoginForm ────────────────────────────────────────────────────────────────

export interface LoginFormProps {
  isLoading?: boolean;
  error?: UseLoginError | null;
  onSubmit: (values: LoginCredentials) => void;
}

export function LoginForm({ isLoading = false, error = null, onSubmit }: LoginFormProps) {
  const [alertDismissed, setAlertDismissed] = useState(false);
  const showAlert = !!error && !alertDismissed;

  useEffect(() => {
    if (error) {
      setAlertDismissed(false);
    }
  }, [error]);

  const handleFormSubmit = (data: LoginFormInput) => {
    onSubmit(toLoginCredentials(data));
  };

  const is500Error = () => {
    if (!error) return false;
    const code = error.code || '';
    return code === '500' || error.message.includes('500');
  };

  const getErrorMessage = () => {
    if (!error) return '';
    if (is500Error()) {
      return 'We apologize for the inconvenience, please try again later';
    }
    return error.message;
  };

  const getErrorTitle = () => {
    if (is500Error()) {
      return 'Something went wrong';
    }
    return AUTH_LABELS.LOGIN.ERROR;
  };

  const fields: FormFieldConfig<LoginFormInput>[] = [
    {
      type: 'custom',
      content: <LoginMethodToggle />,
      colSpan: 12,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'Masukkan email',
      required: true,
      mask: [noWhitespace, maxChars(50)],
      hideRules: [
        {
          defaultHidden: true,
          conditions: [{ field: 'loginMethod', value: 'email' }],
        },
      ],
    },
    {
      name: 'phone',
      type: 'text',
      label: 'No. HP',
      placeholder: 'Masukkan nomor HP',
      required: true,
      prefix: '+62',
      mask: maskPhone,
      hideRules: [
        {
          defaultHidden: true,
          conditions: [{ field: 'loginMethod', value: 'phone' }],
        },
      ],
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      placeholder: 'Masukkan password',
      required: true,
      mask: [noWhitespace, maxChars(50)],
    },
    {
      name: 'rememberMe',
      type: 'checkbox',
      label: AUTH_LABELS.LOGIN.REMEMBER_ME,
    },
  ];

  return (
    <div className="flex w-full max-w-130 flex-col pb-6 bg-white rounded-[14px] shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.1),0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
      {/* Header */}
      <div className="p-6">
        <Image src="/assets/logo-mark.svg" alt="Curva-S" width={119} height={31} priority />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col gap-1.5 px-6">
          <h1 className="text-2xl font-semibold text-black">{AUTH_LABELS.LOGIN.TITLE}</h1>
          <p className="text-base text-slate-500">{AUTH_LABELS.LOGIN.SUBTITLE}</p>
        </div>

        {/* Error alert */}
        {showAlert && (
          <div className="px-6">
            <Alert variant="destructive" showDismiss onDismiss={() => setAlertDismissed(true)}>
              <AlertTitle className="font-semibold">{getErrorTitle()}</AlertTitle>
              <AlertDescription className="text-destructive">{getErrorMessage()}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Form */}
        <div className="px-6">
          <FormGenerator
            schema={loginFormSchema}
            fields={fields}
            onSubmit={handleFormSubmit}
            defaultValues={{
              loginMethod: 'email',
              email: '',
              phone: '',
              password: '',
              rememberMe: false,
            }}
            mode="onChange"
            actions={
              <div className="flex flex-col gap-6">
                <SubmitButton isLoading={isLoading} />
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
