import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EIL Sales Admin',
  robots: 'noindex, nofollow',
};

export default function EILAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
