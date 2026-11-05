'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function getSessionId(): string {
  try {
    const key = 'srv_sid';
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return 'unknown';
  }
}

function send(type: string, page: string, element?: string) {
  const sessionId = getSessionId();
  // Fire-and-forget — never block user interaction
  fetch('/api/analytics', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ type, page, element, sessionId }),
  }).catch(() => {});
}

export default function SiteAnalytics() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);

  // Track page views
  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    send('page_view', pathname);
  }, [pathname]);

  // Track clicks via event delegation
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const el = target.closest('button, a, [role="button"]') as HTMLElement | null;
      if (!el) return;

      const label = (
        el.getAttribute('aria-label') ||
        el.textContent?.trim().slice(0, 80) ||
        el.getAttribute('href') ||
        el.tagName.toLowerCase()
      );

      if (label) send('click', pathname, label);
    }

    document.addEventListener('click', handleClick, { passive: true });
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  return null;
}
