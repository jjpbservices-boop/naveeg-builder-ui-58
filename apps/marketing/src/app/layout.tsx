import type { Metadata } from 'next'
import './globals.css'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export const metadata: Metadata = {
  title: 'Naveeg — Build Your Website',
  description: 'Launch a professional website in minutes. No tech skills needed. AI-powered website generation, hosting, and simple editing.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sansation:wght@300;400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-['Lato',system-ui,sans-serif]">
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
