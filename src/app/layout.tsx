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
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'XIV logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XIV — Options Trading & Research | Marcelo Zapata',
    description:
      'XIV is Marcelo Zapata’s options trading and market research initiative, focused on market structure, execution, and risk management.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#07040c',
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
