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
    default: 'XIV — I am the dragon | Marcelo Zapata',
    template: '%s - Marcelo Zapata',
  },
  description:
    "I am the dragon. XIV is Marcelo Zapata's independent work in trading, market research, analysis agents, and personal tools.",
  keywords: [
    'Marcelo Zapata',
    'XIV',
    'dragon',
    'trading',
    'market research',
    'market analysis',
    'analysis agents',
    'AI engineering',
    'software engineering',
  ],
  authors: [{ name: 'Marcelo Zapata', url: 'https://github.com/marcelozap' }],
  creator: 'Marcelo Zapata',
  openGraph: {
    title: 'XIV — I am the dragon | Marcelo Zapata',
    description:
      "I am the dragon. XIV is Marcelo Zapata's independent work in trading, market research, analysis agents, and personal tools.",
    type: 'website',
    siteName: 'XIV · Marcelo Zapata',
    images: [
      {
        url: '/brand/xiv-dragon-world.png',
        width: 1200,
        height: 600,
        alt: 'XIV’s violet and cyan dragon against a black background.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XIV — I am the dragon | Marcelo Zapata',
    description:
      "I am the dragon. XIV is Marcelo Zapata's independent work in trading, market research, analysis agents, and personal tools.",
    images: ['/brand/xiv-dragon-world.png'],
  },
  icons: {
    icon: [{ url: '/brand/xiv-dragon-emblem.png', type: 'image/png' }],
    shortcut: ['/brand/xiv-dragon-emblem.png'],
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
