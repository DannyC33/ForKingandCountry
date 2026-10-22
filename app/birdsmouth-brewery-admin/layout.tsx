import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | Birdsmouth Brewery',
  robots: 'noindex, nofollow',
};

export default function BirdsmouthAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
