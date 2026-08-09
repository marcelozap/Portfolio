import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
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
    default: 'Marcelo Zapata - Software Engineer, AI Systems',
    template: '%s - Marcelo Zapata',
  },
  description:
    'Software engineering portfolio for AI systems, data automation, research workflows, MaloSound, QA, and public technical projects including Green Machine.',
  keywords: [
    'Marcelo Zapata',
    'software engineer',
    'portfolio',
    'platform engineer',
    'research systems',
    'AI systems',
    'AI evaluation',
    'Green Machine',
    'MaloSound',
    'music technology',
    'data workflows',
    'automation',
    'analytics',
    'software systems',
    'FSU Options Research',
    'Rally',
    'AI systems',
  ],
  authors: [{ name: 'Marcelo Zapata', url: 'https://github.com/marcelozap' }],
  creator: 'Marcelo Zapata',
  openGraph: {
    title: 'Marcelo Zapata - Software Engineer, AI Systems',
    description:
      'Software engineering, AI systems, data automation, research workflows, MaloSound, and public technical projects by Marcelo Zapata.',
    type: 'website',
    siteName: 'Marcelo Zapata Portfolio',
    images: [
      {
        url: '/og-thumbnail-linkedin.png',
        width: 1200,
        height: 627,
        alt: 'Marcelo Zapata portfolio thumbnail with technical mountain terrain and data trails',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marcelo Zapata',
    description:
      'Software engineer building AI systems, data tools, MaloSound, and public research projects.',
    images: ['/og-thumbnail-linkedin.png'],
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
