import { onCLS, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  // Cumulative Layout Shift - target < 0.1
  onCLS((metric: any) => {
    if (metric.value > 0.1) {
      console.warn(`CLS warning: ${metric.value.toFixed(3)}`);
    }
  });

  // Largest Contentful Paint - target < 2.5s
  onLCP((metric: any) => {
    if (metric.value > 2500) {
      console.warn(`LCP warning: ${metric.value.toFixed(0)}ms`);
    }
  });

  // Time to First Byte - informational
  onTTFB((metric: any) => {
    if (metric.value > 600) {
      console.warn(`TTFB: ${metric.value.toFixed(0)}ms`);
    }
  });
}
