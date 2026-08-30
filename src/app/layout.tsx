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
    default: 'Marcelo Zapata - Software Engineer | AI Systems and Automation',
    template: '%s - Marcelo Zapata',
  },
  description:
    'Marcelo Zapata builds reliable software, AI-assisted workflows, QA automation, and data systems around real work.',
  keywords: [
    'Marcelo Zapata',
    'software engineer',
    'portfolio',
    'AI systems',
    'role-based AI',
    'agentic infrastructure',
    'workflow automation',
    'LLM workflows',
    'QA automation',
    'business process automation',
    'XIV',
    'Green Machine',
    'MaloSound',
    'ecommerce automation',
    'marketing automation',
    'teaching systems',
    'management systems',
    'data workflows',
    'data engineering',
    'creative sound',
    'sound design',
    'analytics',
    'software systems',
    'Rally',
  ],
  authors: [{ name: 'Marcelo Zapata', url: 'https://github.com/marcelozap' }],
  creator: 'Marcelo Zapata',
  openGraph: {
    title: 'Marcelo Zapata - Software Engineer | AI Systems and Automation',
    description:
      'Software engineering, QA automation, data workflows, and AI-assisted systems built around real work.',
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
    description:
      'Software engineering, AI systems, automation, and data workflows built around real work.',
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
