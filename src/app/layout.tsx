import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { CustomCursor } from '@/components/interactive/CustomCursor';
import { CommandPaletteProvider } from '@/components/interactive/CommandPalette';
import { AmbientBackdrop } from '@/components/layout/AmbientBackdrop';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TerminalDock } from '@/components/interactive/TerminalDock';

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
    default: 'XIV_OS · Developer · Builder · Creative Technologist',
    template: '%s · XIV_OS',
  },
  description:
    'XIV is a systems-oriented developer and creative technologist building tools, experiences, and ideas. Late nights. Deep focus. Infinite iterations.',
  keywords: [
    'XIV',
    'XIV_OS',
    'portfolio',
    'developer',
    'creative technologist',
    'systems thinking',
    'GATEKPT',
    'Money Machine',
    'Rally',
  ],
  authors: [{ name: 'XIV' }],
  creator: 'XIV',
  openGraph: {
    title: 'XIV_OS',
    description:
      'A cinematic operating system for a developer, builder, creator, and systems thinker.',
    type: 'website',
    siteName: 'XIV_OS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XIV_OS',
    description: 'Systems over noise.',
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
          <CustomCursor />
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Footer />
          <TerminalDock />
        </CommandPaletteProvider>
      </body>
    </html>
  );
}
