import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Electro Impulse Lab | Cooling Equipment',
  robots: 'noindex, nofollow',
};

export default function ElectroImpulseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
