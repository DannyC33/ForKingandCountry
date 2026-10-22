import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendor Portal | Birdsmouth Brewery',
  description: 'Birdsmouth Brewery vendor ordering portal.',
  robots: 'noindex, nofollow',
};

export default function BirdsmouthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
