'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Fires rudderanalytics.page() on every client-side navigation,
// capturing the current page title, full URL, and pathname.
export default function RudderPageView() {
  const pathname  = usePathname();
  const prevPath  = useRef<string | null>(null);

  useEffect(() => {
    // Skip if pathname hasn't changed (StrictMode double-fire guard)
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    // Small delay so the browser updates document.title before we read it
    const timer = setTimeout(() => {
      const rs = (window as unknown as { rudderanalytics?: { page: (props: Record<string, string>) => void } }).rudderanalytics;
      if (!rs || typeof rs.page !== 'function') return;

      rs.page({
        title: document.title,
        url:   window.location.href,
        path:  pathname,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
