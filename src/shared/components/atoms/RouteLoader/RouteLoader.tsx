'use client';

import NextTopLoader from 'nextjs-toploader';

export function RouteLoader() {
  return <NextTopLoader color="#01aaa7" height={3} zIndex={9999} showSpinner={false} />;
}
