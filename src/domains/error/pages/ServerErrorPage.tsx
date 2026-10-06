'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import Icon500 from '../components/Icon500';
import { ERROR_LABELS } from '../constants';

export function ServerErrorPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center gap-24 border border-slate-200 bg-white px-8 py-12">
      <div className="flex w-full max-w-5xl flex-col items-center gap-24 px-8">
        {/* Illustration Section */}
        <div className="flex items-center justify-center">
          <div className="flex h-96 w-96 items-center justify-center rounded-2xl">
            <Icon500 />
          </div>
        </div>
      </div>

      {/* Text Section */}
      <div className="flex flex-col items-center gap-11">
        {/* Large Error Number */}
        <div className="text-center">
          <h1 className="text-9xl font-bold text-slate-950">{ERROR_LABELS.SERVER_ERROR.CODE}</h1>
        </div>

        {/* Content Section */}
        <div className="flex flex-col items-center gap-8">
          {/* Heading */}
          <div className="flex flex-col items-center gap-1.5">
            <h2 className="text-center text-3xl font-semibold text-slate-950">
              {ERROR_LABELS.SERVER_ERROR.TITLE}
            </h2>
            <p className="text-center text-base font-normal text-slate-500">
              {ERROR_LABELS.SERVER_ERROR.DESCRIPTION}
            </p>
          </div>

          {/* Button */}
          <Button onClick={() => router.push('/')} size="lg">
            {ERROR_LABELS.SERVER_ERROR.BUTTON}
          </Button>
        </div>
      </div>
    </div>
  );
}
