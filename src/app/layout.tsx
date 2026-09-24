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
    default: 'Marcelo Zapata — Software, AI, Data, Sound',
    template: '%s - Marcelo Zapata',
  },
  description:
    'Marcelo Zapata builds reliable software and AI workflows, writes about the work, and makes songs in English and Spanish.',
  keywords: [
    'Marcelo Zapata',
    'XIV',
    'software engineering',
    'QA automation',
    'AI workflows',
    'data systems',
    'songwriter',
    'MaloSound',
  ],
  authors: [{ name: 'Marcelo Zapata', url: 'https://github.com/marcelozap' }],
  creator: 'Marcelo Zapata',
  openGraph: {
    title: 'Marcelo Zapata — Software, AI, Data, Sound',
    description: 'Software, AI, data, and sound by Marcelo Zapata.',
    type: 'website',
    siteName: 'Marcelo Zapata',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marcelo Zapata — Software, AI, Data, Sound',
    description: 'Software, AI, data, and sound by Marcelo Zapata.',
  },
  icons: {
    icon: [
      { url: '/brand/favicon.ico', sizes: 'any' },
      { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: ['/brand/favicon.ico'],
    apple: '/brand/apple-touch-icon.png',
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
