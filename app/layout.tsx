import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Servus - Technology for Your Customers',
    template: '%s | Servus',
  },
  description: 'Servus — a tailored online experience at an affordable price.',
  openGraph: {
    title: 'Servus - Technology for Your Customers',
    description: 'Servus — a tailored online experience at an affordable price.',
    images: [
      {
        url: '/DanielFedakHeadshot.jpeg',
        width: 1200,
        height: 630,
        alt: 'Servus - Technology for Your Customers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Servus - Technology for Your Customers',
    description: 'Servus — a tailored online experience at an affordable price.',
    images: ['/DanielFedakHeadshot.jpeg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
