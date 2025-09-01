import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Naveeg - Build Your Website in Minutes',
  description: 'Launch a professional website in minutes. No tech skills needed. AI-powered website generation, hosting, and simple editing.',
  keywords: 'website builder, AI website, small business, hosting, WordPress',
  authors: [{ name: 'Naveeg Team' }],
  openGraph: {
    title: 'Naveeg - Build Your Website in Minutes',
    description: 'Launch a professional website in minutes. No tech skills needed.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Naveeg - Build Your Website in Minutes',
    description: 'Launch a professional website in minutes. No tech skills needed.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
