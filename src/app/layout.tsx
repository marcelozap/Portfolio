import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AmbientBackdrop } from '@/components/layout/AmbientBackdrop';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Inter({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://marcelozapata.dev'),
  title: {
    default: 'XIV — Options Trading & Research | Marcelo Zapata',
    template: '%s - Marcelo Zapata',
  },
  description:
    'XIV is Marcelo Zapata’s options trading and market research initiative, focused on market structure, execution, and risk management.',
  keywords: [
    'Marcelo Zapata',
    'XIV',
    'dragon',
    'trading',
    'market research',
    'market analysis',
    'options trading',
    'risk management',
    'market structure',
  ],
  authors: [{ name: 'Marcelo Zapata', url: 'https://github.com/marcelozap' }],
  creator: 'Marcelo Zapata',
  openGraph: {
    title: 'XIV — Options Trading & Research | Marcelo Zapata',
    description:
      'XIV is Marcelo Zapata’s options trading and market research initiative, focused on market structure, execution, and risk management.',
    type: 'website',
    siteName: 'XIV · Marcelo Zapata',
    images: [
      {
        url: '/brand/xiv-red-skyline.png',
        width: 1774,
        height: 887,
        alt: 'XIV in red, black and white, with the dragon forming the I.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XIV — Options Trading & Research | Marcelo Zapata',
    description:
      'XIV is Marcelo Zapata’s options trading and market research initiative, focused on market structure, execution, and risk management.',
    images: ['/brand/xiv-red-skyline.png'],
  },
  icons: {
    icon: [{ url: '/brand/xiv-red-emblem.png', type: 'image/png' }],
    shortcut: ['/brand/xiv-red-emblem.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#080708',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="relative antialiased">
        <AmbientBackdrop />
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
