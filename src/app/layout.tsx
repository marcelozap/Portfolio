import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { CommandPaletteProvider } from '@/components/interactive/CommandPalette';
import { SoundToggle } from '@/components/interactive/SoundToggle';
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
  metadataBase: new URL('https://marcelozapata.dev'),
  title: {
    default: 'Marcelo Zapata - Software Engineer',
    template: '%s - Marcelo Zapata',
  },
  description: 'Marcelo Zapata builds software tools for work, trading, music, and movement.',
  keywords: [
    'Marcelo Zapata',
    'software engineer',
    'portfolio',
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
    title: 'Marcelo Zapata - Software Engineer',
    description: 'Software, tools, music, and movement by Marcelo Zapata.',
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
    description: 'Software engineer. Builder. Tennis, guitar, systems.',
    images: ['/og-thumbnail-linkedin.png'],
  },
  icons: {
    icon: [
      { url: '/brand/gatekpt-icon.png', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/brand/gatekpt-icon.png'],
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
          <SoundToggle />
          <Footer />
        </CommandPaletteProvider>
      </body>
    </html>
  );
}
