import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { CommandPaletteProvider } from '@/components/interactive/CommandPalette';
import { AmbientBackdrop } from '@/components/layout/AmbientBackdrop';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://xiv-os.vercel.app'),
  title: {
    default: 'Marcelo Zapata — Software Engineer | Systems, Product, Automation',
    template: '%s — Marcelo Zapata',
  },
  description:
    'Marcelo Zapata is a software engineer building reliable tools, automation, analytics, and product-driven software across professional delivery and independent projects.',
  keywords: [
    'Marcelo Zapata',
    'software engineer',
    'portfolio',
    'product engineer',
    'platform engineer',
    'automation',
    'analytics',
    'software systems',
    'GATEKPT',
    'Green Machine',
    'Rally',
  ],
  authors: [{ name: 'Marcelo Zapata', url: 'https://github.com/marcelozap' }],
  creator: 'Marcelo Zapata',
  openGraph: {
    title: 'Marcelo Zapata — Software Engineer',
    description:
      'Portfolio of software engineering work across systems, automation, analytics, product design, and creative technology.',
    type: 'website',
    siteName: 'Marcelo Zapata Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marcelo Zapata',
    description: 'Software engineer · systems, product, automation',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#06090d',
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
        <CommandPaletteProvider>
          <AmbientBackdrop />
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Footer />
        </CommandPaletteProvider>
      </body>
    </html>
  );
}
