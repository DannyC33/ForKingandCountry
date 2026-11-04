import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | Servus',
  robots: 'noindex, nofollow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Servus Admin',
    statusBarStyle: 'black-translucent',
  },
};

export default function ServusAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
