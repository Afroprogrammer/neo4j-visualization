import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'neo4j-visualization',
  description: 'Neo4j Visualization Project',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
