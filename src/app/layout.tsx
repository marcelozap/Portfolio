import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { CustomCursor } from '@/components/interactive/CustomCursor';
import { CommandPaletteProvider } from '@/components/interactive/CommandPalette';
import { AmbientBackdrop } from '@/components/layout/AmbientBackdrop';
import { AmbientMotifs } from '@/components/layout/AmbientMotifs';
import { AmbientSpaceman } from '@/components/interactive/AmbientSpaceman';
import { AmbientAudio } from '@/components/interactive/AmbientAudio';
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
    default: 'Marcelo Zapata — Software Engineer',
    template: '%s — Marcelo Zapata',
  },
  description:
    'Marcelo Zapata — software engineer. Selected work in systems, markets research (Green Machine kernel), music, and interactive design. Creative releases may appear as XIV.',
  keywords: [
    'Marcelo Zapata',
    'software engineer',
    'XIV',
    'portfolio',
    'GATEKPT',
    'Green Machine',
    'Rally',
    'Publix',
  ],
  authors: [{ name: 'Marcelo Zapata', url: 'https://github.com/marcelozap' }],
  creator: 'Marcelo Zapata',
  openGraph: {
    title: 'Marcelo Zapata — Software Engineer',
    description:
      'Software engineer at Publix. Portfolio of engineering work, tools, and original music.',
    type: 'website',
    siteName: 'XIV_OS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marcelo Zapata',
    description: 'Software engineer · portfolio',
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
          <AmbientMotifs />
          <AmbientSpaceman />
          <AmbientAudio />
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
