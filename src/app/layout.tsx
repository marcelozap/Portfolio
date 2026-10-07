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
    default: 'Marcelo Zapata — Software Engineer | Automation & Quality Engineering',
    template: '%s - Marcelo Zapata',
  },
  description:
    'Marcelo Zapata: software engineer focused on workflow and report automation, data validation, and manual and automated testing. Power Platform, SQL, and Azure.',
  keywords: [
    'Marcelo Zapata',
    'XIV',
    'software engineering',
    'QA automation',
    'workflow automation',
    'report automation',
    'data validation',
    'Power Automate',
    'Power Apps',
    'Azure Databricks',
    'Azure Pipelines',
    'AI workflows',
    'data systems',
    'options research',
    'risk management',
  ],
  authors: [{ name: 'Marcelo Zapata', url: 'https://github.com/marcelozap' }],
  creator: 'Marcelo Zapata',
  openGraph: {
    title: 'Marcelo Zapata — Software Engineer | Automation & Quality Engineering',
    description:
      'Workflow and report automation, data validation, and software testing. Explore Marcelo Zapata’s engineering experience and projects.',
    type: 'website',
    siteName: 'Marcelo Zapata',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marcelo Zapata — Software Engineer | Automation & Quality Engineering',
    description:
      'Workflow and report automation, data validation, and software testing. Explore Marcelo Zapata’s engineering experience and projects.',
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
