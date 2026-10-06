'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import Icon404 from '../components/Icon404';
import { ERROR_LABELS } from '../constants';

export function NotFoundPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-24 border border-slate-200 bg-white px-8 py-24">
      <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-24">
        {/* Illustration Section */}
        <div className="flex max-h-96 max-w-96 flex-col items-start gap-2.5">
          {/* Placeholder for illustration - replace with actual SVG from Figma */}
          <div className="flex h-96 w-96 items-center justify-center">
            <div className="text-center">
              <Icon404 />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col items-center gap-5">
          {/* Text Container */}
          <div className="flex flex-col items-center gap-1.5">
            <h1 className="text-center text-2xl font-semibold text-slate-950">
              {ERROR_LABELS.NOT_FOUND.TITLE}
            </h1>
            <p className="text-center text-base font-normal text-slate-950">
              {ERROR_LABELS.NOT_FOUND.DESCRIPTION}
            </p>
          </div>

          {/* Button */}
          <Button onClick={handleGoBack} size={'lg'}>
            {ERROR_LABELS.NOT_FOUND.BUTTON}
          </Button>
        </div>
      </div>
    </div>
  );
}
