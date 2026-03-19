import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pixel Loop Studio',
  description: 'Turn videos into looping pixel-art animations',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js"
          integrity="sha384-OLBgp1GsljhM2TJ+sbHjaiH9txEUvgdDTAzHv2P24donTt6/529l+9Ua0vFImLlb"
          crossOrigin="anonymous"
          async={true}
        />
      </head>
      <body className="bg-black text-white font-mono overflow-hidden">{children}</body>
    </html>
  )
}
