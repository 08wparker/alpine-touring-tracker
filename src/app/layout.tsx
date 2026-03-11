import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import AuthProvider from '@/components/AuthProvider'
import StravaAuth from '@/components/StravaAuth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Alpine Touring Tracker',
  description: 'Discover alpine touring routes, huts, and objectives',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <header className="bg-alpine-green text-white">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Alpine Touring Tracker</h1>
                <StravaAuth />
              </div>
              <nav className="flex space-x-6">
                <a href="/" className="px-4 py-2 rounded-lg bg-alpine-green-light hover:bg-alpine-green-dark transition-colors">
                  Haute Route
                </a>
                <a href="/berner-oberland" className="px-4 py-2 rounded-lg bg-alpine-green-light hover:bg-alpine-green-dark transition-colors">
                  Berner Oberland
                </a>
                <a href="/ortler" className="px-4 py-2 rounded-lg bg-alpine-green-light hover:bg-alpine-green-dark transition-colors">
                  Ortler Group
                </a>
                <a href="/silvretta" className="px-4 py-2 rounded-lg bg-alpine-green-light hover:bg-alpine-green-dark transition-colors">
                  Silvretta
                </a>
                <a href="/norway" className="px-4 py-2 rounded-lg bg-alpine-green-light hover:bg-alpine-green-dark transition-colors">
                  Norway
                </a>
              </nav>
            </div>
          </header>
          <main className="min-h-screen bg-snow-white">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}