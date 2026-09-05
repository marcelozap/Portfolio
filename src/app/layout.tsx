import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AmbientBackdrop } from '@/components/layout/AmbientBackdrop';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PersistentAudioPlayer } from '@/components/layout/PersistentAudioPlayer';

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
    "I am the dragon. XIV is Marcelo Zapata's world of markets, research, music, movement, code, and writing.",
  keywords: [
    'Marcelo Zapata',
    'XIV',
    'dragon',
    'market research',
    'music',
    'movement',
    'creative technology',
    'software engineering',
    'public writing',
    'MaloSound',
    'sound design',
    'Rally',
  ],
  authors: [{ name: 'Marcelo Zapata', url: 'https://github.com/marcelozap' }],
  creator: 'Marcelo Zapata',
  openGraph: {
    title: 'XIV — I am the dragon | Marcelo Zapata',
    description:
      'I am the dragon. Markets, research, music, movement, code, and writing inside XIV.',
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
      'I am the dragon. Markets, research, music, movement, code, and writing inside XIV.',
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
      <body className="relative pb-28 antialiased">
        <AmbientBackdrop />
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
        <PersistentAudioPlayer />
      </body>
    </html>
  );
}
