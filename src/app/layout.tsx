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
    default: 'Marcelo Zapata - Software, AI, Data, Sound',
    template: '%s - Marcelo Zapata',
  },
  description:
    'Software, AI research, data systems, teaching, and original MaloSound audio by Marcelo Zapata. Translation between people, systems, language, and machines.',
  keywords: [
    'Marcelo Zapata',
    'software engineer',
    'portfolio',
    'platform engineer',
    'research systems',
    'AI systems',
    'AI evaluation',
    'GateKPT',
    'Green Machine',
    'MaloSound',
    'music technology',
    'data workflows',
    'data engineering',
    'creative sound',
    'sound design',
    'automation',
    'analytics',
    'software systems',
    'Rally',
  ],
  authors: [{ name: 'Marcelo Zapata', url: 'https://github.com/marcelozap' }],
  creator: 'Marcelo Zapata',
  openGraph: {
    title: 'Marcelo Zapata - Software, AI, Data, Sound',
    description:
      'Translation between people, systems, language, and machines. AI writing at GateKPT in English and Spanish.',
    type: 'website',
    siteName: 'Marcelo Zapata Portfolio',
    images: [
      {
        url: '/og-xiv-command.png',
        width: 1680,
        height: 945,
        alt: 'Cinematic software and AI key visual in a rainy neon international city',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marcelo Zapata',
    description: 'Software, AI research, data systems, teaching, and original sound design.',
    images: ['/og-xiv-command.png'],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: ['/favicon.svg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#05070D',
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
