import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Keep Shining in His Grace | Emeritus Ceremony',
  description: 'Emeritus Ceremony Invitation for Pdt. Ny. Meinita M.E. Wungo-Damping',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0', // Prevents zooming on mobile inputs
  openGraph: {
    title: 'Keep Shining in His Grace | Emeritus Ceremony',
    description: 'Emeritus Ceremony Invitation for Pdt. Ny. Meinita M.E. Wungo-Damping',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Keep Shining in His Grace | Emeritus Ceremony',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Keep Shining in His Grace | Emeritus Ceremony',
    description: 'Emeritus Ceremony Invitation for Pdt. Ny. Meinita M.E. Wungo-Damping',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <main className="desktop-fallback">
          {/* Main Mobile Constraint Container */}
          <div className="mobile-container">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
