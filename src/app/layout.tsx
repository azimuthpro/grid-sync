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
  title: 'GridSync - Energy Balance Management for Prosumers',
  description:
    'Desktop web application for prosumers that automates energy balance calculations from photovoltaic installations and generates reports for grid operators.',
  keywords: [
    'photovoltaic',
    'PV installations',
    'energy balance',
    'prosumer',
    'grid operators',
    'energy consumption',
    'solar energy',
    'energy reports',
    'AI assistant',
    'energy optimization',
  ],
  authors: [{ name: 'Matt Sowa' }],
  creator: 'Matt Sowa',
  publisher: 'GridSync',
  applicationName: 'GridSync',
  category: 'Energy Management',
  classification: 'Energy & Utilities',
  openGraph: {
    title: 'GridSync - Energy Balance Management for Prosumers',
    description:
      'Automate energy balance calculations from photovoltaic installations and generate reports for grid operators. Manage multiple PV locations, create consumption profiles, and get AI-powered energy optimization advice.',
    type: 'website',
    locale: 'en_US',
    siteName: 'GridSync',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GridSync - Energy Balance Management Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GridSync - Energy Balance Management for Prosumers',
    description:
      'Automate energy balance calculations from photovoltaic installations and generate reports for grid operators.',
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
