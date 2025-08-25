import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GridSync - Zarządzanie Bilansem Energetycznym dla Prosumentów',
  description:
    'Aplikacja desktopowa dla prosumentów automatyzująca obliczenia bilansu energetycznego z instalacji fotowoltaicznych i generująca raporty dla operatorów sieci.',
  keywords: [
    'fotowoltaika',
    'instalacje PV',
    'bilans energetyczny',
    'prosument',
    'operatorzy sieci',
    'zużycie energii',
    'energia słoneczna',
    'raporty energetyczne',
    'asystent AI',
    'optymalizacja energii',
    'prosumenci',
    'zarządzanie energią',
  ],
  authors: [{ name: 'Matt Sowa' }],
  creator: 'Matt Sowa',
  publisher: 'GridSync',
  applicationName: 'GridSync',
  category: 'Energy Management',
  classification: 'Energy & Utilities',
  openGraph: {
    title: 'GridSync - Zarządzanie Bilansem Energetycznym dla Prosumentów',
    description:
      'Automatyzuj obliczenia bilansu energetycznego z instalacji fotowoltaicznych i generuj raporty dla operatorów sieci. Zarządzaj wieloma lokalizacjami PV, twórz profile zużycia i otrzymuj porady AI.',
    type: 'website',
    locale: 'pl_PL',
    siteName: 'GridSync',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GridSync - Platforma Zarządzania Bilansem Energetycznym',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GridSync - Zarządzanie Bilansem Energetycznym dla Prosumentów',
    description:
      'Automatyzuj obliczenia bilansu energetycznego z instalacji fotowoltaicznych i generuj raporty dla operatorów sieci.',
    images: ['/og-image.png'],
    creator: '@gridsync',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
