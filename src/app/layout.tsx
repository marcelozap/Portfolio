import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Libre_Baskerville } from 'next/font/google';
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

const display = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
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
  description:
    'Software engineering portfolio for data automation, research systems, AI-assisted workflows, and selected projects.',
  keywords: [
    'Marcelo Zapata',
    'software engineer',
    'portfolio',
    'platform engineer',
    'research systems',
    'data workflows',
    'automation',
    'analytics',
    'software systems',
    'FSU Options Research',
    'Rally',
    'AI Workflow Systems',
  ],
  authors: [{ name: 'Marcelo Zapata', url: 'https://github.com/marcelozap' }],
  creator: 'Marcelo Zapata',
  openGraph: {
    title: 'Marcelo Zapata - Software Engineer',
    description:
      'Software engineering, data automation, research systems, and selected projects by Marcelo Zapata.',
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
    description: 'Software engineer. Data automation, research systems, and AI-assisted workflows.',
    images: ['/og-thumbnail-linkedin.png'],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: ['/favicon.svg'],
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
