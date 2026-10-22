import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NYL Financial Planner',
  robots: 'noindex, nofollow',
};

export default function NYLLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
