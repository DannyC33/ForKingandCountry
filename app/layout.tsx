import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import CookieConsent from '@/components/CookieConsent';
import TrackingScripts from '@/components/TrackingScripts';
import RudderPageView from '@/components/RudderPageView';

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
      {/* Google tag (gtag.js) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-MCDFFJVR0B"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-MCDFFJVR0B');
      `}</Script>
      <body className="min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[500] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-brand-600 focus:font-semibold focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
        <RudderPageView />
        <TrackingScripts />
        <CookieConsent />
      </body>
    </html>
  );
}
